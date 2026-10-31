import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDb } from '../../src/db.js';
import { runMigrations } from '../../src/migrate.js';
import { createAuthenticator } from '../../src/middleware/authenticate.js';
import { runBilling } from '../../src/services/billing-run.js';

// Runs against a real PostgreSQL. Skipped unless TEST_DATABASE_URL is set.
// The suite truncates tables, so the database name must contain "test".
const url = process.env.TEST_DATABASE_URL;
const JWT_SECRET = 'billing-integration-test-secret';
const PASSWORD = 'Example!Pass9';

describe('subscriptions, invoices, and batch billing (integration)', { skip: url ? false : 'TEST_DATABASE_URL is not set' }, () => {
  let db;
  let server;
  let base;

  async function call(method, path, { token, body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = res.status === 204 ? null : await res.json();
    return { status: res.status, body: json };
  }

  async function account(email, role) {
    const signup = await call('POST', '/api/auth/signup', {
      body: { name: role, email, password: PASSWORD },
    });
    assert.equal(signup.status, 201, JSON.stringify(signup.body));
    if (role !== 'CUSTOMER') {
      await db.query('UPDATE users SET role = $2 WHERE id = $1', [signup.body.data.id, role]);
    }
    const login = await call('POST', '/api/auth/login', { body: { email, password: PASSWORD } });
    return { id: signup.body.data.id, token: login.body.data.access_token };
  }

  // Standard fixture: 100.00 per seat, monthly, minimum 2 seats, 10% tax.
  async function fixture() {
    const admin = await account('admin@billing.test', 'ADMIN');
    const staff = await account('staff@billing.test', 'STAFF');
    const customer = await account('customer@billing.test', 'CUSTOMER');

    const product = await call('POST', '/api/products', {
      token: admin.token,
      body: { name: 'Workspace', sale_price: '100.00' },
    });
    const variant = await call('POST', `/api/products/${product.body.data.id}/variants`, {
      token: admin.token,
      body: { attribute: 'Seats', value: 'Standard', price_extra: '0.00' },
    });
    const plan = await call('POST', '/api/plans', {
      token: admin.token,
      body: {
        name: 'Monthly Workspace',
        product_variant_id: variant.body.data.id,
        billing_interval: 'MONTH',
        minimum_quantity: 2,
        end_behavior: 'AUTO_CLOSE',
      },
    });
    const tax = await call('POST', '/api/taxes', {
      token: admin.token,
      body: { name: 'Standard tax', rate_percent: '10.00' },
    });
    return { admin, staff, customer, plan: plan.body.data, tax: tax.body.data };
  }

  async function createSubscription(f, overrides = {}) {
    const res = await call('POST', '/api/subscriptions', {
      token: f.admin.token,
      body: {
        customer_id: f.customer.id,
        plan_id: f.plan.id,
        tax_id: f.tax.id,
        quantity: 3,
        start_date: '2026-10-01',
        ...overrides,
      },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.data;
  }

  async function activate(f, subscriptionId) {
    for (const action of ['confirm', 'activate']) {
      const res = await call('POST', `/api/subscriptions/${subscriptionId}/${action}`, { token: f.admin.token });
      assert.equal(res.status, 200, JSON.stringify(res.body));
    }
  }

  async function invoicesFor(subscriptionId) {
    const { rows } = await db.query(
      'SELECT to_char(period_start, \'YYYY-MM-DD\') AS period_start FROM invoices WHERE subscription_id = $1 ORDER BY period_start',
      [subscriptionId],
    );
    return rows.map((r) => r.period_start);
  }

  before(async () => {
    db = createDb(url);
    await runMigrations(db);
    const app = createApp({
      db,
      corsOrigins: [],
      authenticate: createAuthenticator({ db, jwtSecret: JWT_SECRET }),
      jwtSecret: JWT_SECRET,
      jwtExpiresMinutes: 60,
    });
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await db.query(
      'TRUNCATE invoices, subscriptions, taxes, plans, product_variants, products, users RESTART IDENTITY CASCADE',
    );
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  });

  describe('subscription creation', () => {
    test('a new subscription starts in DRAFT with a generated number', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      assert.equal(sub.status, 'DRAFT');
      assert.match(sub.number, /^SUB-\d{6}$/);
      assert.equal(sub.quantity, 3);
      assert.equal(sub.start_date, '2026-10-01');
    });

    test('rejects a quantity below the plan minimum', async () => {
      const f = await fixture();
      const res = await call('POST', '/api/subscriptions', {
        token: f.admin.token,
        body: { customer_id: f.customer.id, plan_id: f.plan.id, quantity: 1, start_date: '2026-10-01' },
      });
      assert.equal(res.status, 422);
      assert.match(res.body.error.details.quantity, /minimum quantity for this plan is 2/);
    });

    test('rejects a subscription for a non-customer account', async () => {
      const f = await fixture();
      const res = await call('POST', '/api/subscriptions', {
        token: f.admin.token,
        body: { customer_id: f.staff.id, plan_id: f.plan.id, quantity: 2, start_date: '2026-10-01' },
      });
      assert.equal(res.status, 422);
      assert.ok(res.body.error.details.customer_id);
    });

    test('rejects a start date outside the plan availability window', async () => {
      const f = await fixture();
      await db.query("UPDATE plans SET available_from = '2026-11-01' WHERE id = $1", [f.plan.id]);
      const res = await call('POST', '/api/subscriptions', {
        token: f.admin.token,
        body: { customer_id: f.customer.id, plan_id: f.plan.id, quantity: 2, start_date: '2026-10-01' },
      });
      assert.equal(res.status, 422);
      assert.match(res.body.error.details.start_date, /not available before 2026-11-01/);
    });

    test('customers cannot create subscriptions', async () => {
      const f = await fixture();
      const res = await call('POST', '/api/subscriptions', {
        token: f.customer.token,
        body: { customer_id: f.customer.id, plan_id: f.plan.id, quantity: 2, start_date: '2026-10-01' },
      });
      assert.equal(res.status, 403);
    });
  });

  describe('subscription state machine guard (server side)', () => {
    test('Draft -> Confirmed -> Active -> Closed, one step at a time', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      const steps = [
        ['confirm', 'CONFIRMED'],
        ['activate', 'ACTIVE'],
        ['close', 'CLOSED'],
      ];
      for (const [action, expected] of steps) {
        const res = await call('POST', `/api/subscriptions/${sub.id}/${action}`, { token: f.admin.token });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.body.data.status, expected);
      }
    });

    test('skipping a step returns 409 and leaves the status unchanged', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      const res = await call('POST', `/api/subscriptions/${sub.id}/activate`, { token: f.admin.token });
      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, 'INVALID_TRANSITION');
      assert.equal(res.body.error.details.current_status, 'DRAFT');
      const stored = await db.query('SELECT status FROM subscriptions WHERE id = $1', [sub.id]);
      assert.equal(stored.rows[0].status, 'DRAFT');
    });

    test('repeating an action returns 409, and Closed cannot be reactivated', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await call('POST', `/api/subscriptions/${sub.id}/confirm`, { token: f.admin.token });
      assert.equal((await call('POST', `/api/subscriptions/${sub.id}/confirm`, { token: f.admin.token })).status, 409);
      assert.equal((await call('POST', `/api/subscriptions/${sub.id}/activate`, { token: f.admin.token })).status, 200);
      await call('POST', `/api/subscriptions/${sub.id}/close`, { token: f.admin.token });
      const reactivate = await call('POST', `/api/subscriptions/${sub.id}/activate`, { token: f.admin.token });
      assert.equal(reactivate.status, 409);
    });

    test('the guard is enforced in SQL, so a stale state cannot move the row', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      // Someone else moves it to CONFIRMED after the route has read DRAFT.
      // The route must then fail its conditional UPDATE, not overwrite the new state.
      const { applyTransition } = await import('../../src/services/transitions.js');
      const { subscriptionMachine } = await import('../../src/billing.js');
      await db.query("UPDATE subscriptions SET status = 'CONFIRMED' WHERE id = $1", [sub.id]);
      await db.query("UPDATE subscriptions SET status = 'DRAFT' WHERE id = $1", [sub.id]);
      const original = db.query.bind(db);
      let raced = false;
      const racingDb = {
        query: async (text, params) => {
          if (!raced && text.startsWith('SELECT status FROM subscriptions')) {
            raced = true;
            const result = await original(text, params);
            await original("UPDATE subscriptions SET status = 'CONFIRMED' WHERE id = $1", [sub.id]);
            return result;
          }
          return original(text, params);
        },
      };
      await assert.rejects(
        applyTransition(racingDb, { table: 'subscriptions', machine: subscriptionMachine, id: sub.id, action: 'confirm', label: 'Subscription' }),
        (err) => err.status === 409 && err.code === 'INVALID_TRANSITION',
      );
      const stored = await db.query('SELECT status FROM subscriptions WHERE id = $1', [sub.id]);
      assert.equal(stored.rows[0].status, 'CONFIRMED');
    });
  });

  describe('batch billing', () => {
    test('only Active subscriptions are billed', async () => {
      const f = await fixture();
      const draft = await createSubscription(f);
      const res = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.created_count, 0);
      assert.deepEqual(await invoicesFor(draft.id), []);
    });

    test('an active subscription gets one invoice with tax calculated automatically', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);

      const res = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.created_count, 1);

      const invoices = await call('GET', `/api/invoices?subscription_id=${sub.id}`, { token: f.admin.token });
      const invoice = invoices.body.data[0];
      assert.equal(invoice.status, 'DRAFT');
      assert.equal(invoice.subtotal, '300.00');
      assert.equal(invoice.discount_amount, '0.00');
      assert.equal(invoice.tax_rate_percent, '10.00');
      assert.equal(invoice.tax_amount, '30.00');
      assert.equal(invoice.total, '330.00');
      assert.equal(invoice.period_start, '2026-10-01');
      assert.equal(invoice.period_end, '2026-11-01');
      assert.equal(invoice.due_date, '2026-10-16', 'due 15 days after the period starts');
      assert.match(invoice.number, /^INV-\d{6}$/);
    });

    test('running the batch twice for the same date creates no second invoice (idempotency)', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);

      const first = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      const second = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });

      assert.equal(first.body.data.created_count, 1);
      assert.equal(second.body.data.created_count, 0, 'second run must create nothing');
      assert.deepEqual(second.body.data.invoices, []);
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01'], 'exactly one invoice in the database');
    });

    test('running the batch many times in a row never duplicates an invoice', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      for (let i = 0; i < 5; i += 1) {
        await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-20' } });
      }
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01']);
    });

    test('a later run bills the next period and does not repeat the earlier one', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      const next = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-11-02' } });
      assert.equal(next.body.data.created_count, 1);
      assert.equal(next.body.data.invoices[0].period_start, '2026-11-01');
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01', '2026-11-01']);
    });

    test('periods missed while no run happened are caught up, not skipped', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      // No runs in November or December. One run in January catches up both.
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2027-01-05' } });
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01', '2026-11-01', '2026-12-01', '2027-01-01']);
    });

    test('two concurrent runs for the same date create each invoice exactly once', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });

      const [a, b] = await Promise.all([
        runBilling(db, { asOf: '2026-12-01' }),
        runBilling(db, { asOf: '2026-12-01' }),
      ]);
      assert.equal(a.created_count + b.created_count, 2, 'Nov and Dec, each created once across both runs');
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01', '2026-11-01', '2026-12-01']);
    });

    test('a run that fails part-way leaves no invoices behind, and a retry is complete', async () => {
      const f = await fixture();
      const first = await createSubscription(f);
      const second = await createSubscription(f, { quantity: 2 });
      await activate(f, first.id);
      await activate(f, second.id);

      await assert.rejects(
        runBilling(db, {
          asOf: '2026-10-15',
          afterInvoiceCreated: (count) => {
            if (count === 2) throw new Error('simulated failure after the first invoice');
          },
        }),
        /simulated failure/,
      );

      const { rows } = await db.query('SELECT count(*)::int AS n FROM invoices');
      assert.equal(rows[0].n, 0, 'the first invoice must be rolled back with the rest of the run');

      const retry = await runBilling(db, { asOf: '2026-10-15' });
      assert.equal(retry.created_count, 2, 'the retry bills both subscriptions, so nothing is skipped');
    });

    test('a closed subscription gets no future invoices', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      await call('POST', `/api/subscriptions/${sub.id}/close`, { token: f.admin.token });

      const later = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2027-03-01' } });
      assert.equal(later.body.data.created_count, 0);
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01']);
    });

    test('no period starting on or after the expiry date is billed', async () => {
      const f = await fixture();
      const sub = await createSubscription(f, { expiry_date: '2026-11-01' });
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-12-15' } });
      assert.deepEqual(await invoicesFor(sub.id), ['2026-10-01']);
    });

    test('staff can run billing, customers cannot', async () => {
      const f = await fixture();
      assert.equal((await call('POST', '/api/billing/run', { token: f.staff.token, body: { as_of: '2026-10-15' } })).status, 200);
      assert.equal((await call('POST', '/api/billing/run', { token: f.customer.token, body: { as_of: '2026-10-15' } })).status, 403);
    });
  });

  describe('invoice state machine', () => {
    test('a draft invoice can be confirmed, and a confirmed one cancelled', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      const [invoice] = (await call('GET', '/api/invoices', { token: f.admin.token })).body.data;

      const confirmed = await call('POST', `/api/invoices/${invoice.id}/confirm`, { token: f.admin.token });
      assert.equal(confirmed.body.data.status, 'CONFIRMED');

      const cancelled = await call('POST', `/api/invoices/${invoice.id}/cancel`, { token: f.admin.token });
      assert.equal(cancelled.body.data.status, 'CANCELLED');

      const again = await call('POST', `/api/invoices/${invoice.id}/confirm`, { token: f.admin.token });
      assert.equal(again.status, 409);
    });

    test('a cancelled invoice still blocks re-billing its period', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      const [invoice] = (await call('GET', '/api/invoices', { token: f.admin.token })).body.data;
      await call('POST', `/api/invoices/${invoice.id}/cancel`, { token: f.admin.token });

      const rerun = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      assert.equal(rerun.body.data.created_count, 0, 'a cancelled period must not be invoiced again');
    });

    test('lists invoices filtered by status', async () => {
      const f = await fixture();
      const sub = await createSubscription(f);
      await activate(f, sub.id);
      await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: '2026-10-15' } });
      const drafts = await call('GET', '/api/invoices?status=DRAFT', { token: f.admin.token });
      const paid = await call('GET', '/api/invoices?status=PAID', { token: f.admin.token });
      assert.equal(drafts.body.meta.total, 1);
      assert.equal(paid.body.meta.total, 0);
    });
  });

  describe('tax rules', () => {
    test('admins set tax rules, and rates above 100 are rejected', async () => {
      const f = await fixture();
      assert.equal(
        (await call('POST', '/api/taxes', { token: f.admin.token, body: { name: 'Too high', rate_percent: '150' } })).status,
        422,
      );
      assert.equal(
        (await call('POST', '/api/taxes', { token: f.staff.token, body: { name: 'Staff tax', rate_percent: '5.00' } })).status,
        403,
      );
    });
  });
});
