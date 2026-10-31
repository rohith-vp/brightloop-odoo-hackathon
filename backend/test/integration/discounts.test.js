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
const JWT_SECRET = 'discount-integration-test-secret';
const PASSWORD = 'Example!Pass9';

describe('discount rules at invoice generation (integration)', { skip: url ? false : 'TEST_DATABASE_URL is not set' }, () => {
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
    const signup = await call('POST', '/api/auth/signup', { body: { name: role, email, password: PASSWORD } });
    assert.equal(signup.status, 201, JSON.stringify(signup.body));
    if (role !== 'CUSTOMER') await db.query('UPDATE users SET role = $2 WHERE id = $1', [signup.body.data.id, role]);
    const login = await call('POST', '/api/auth/login', { body: { email, password: PASSWORD } });
    return { id: signup.body.data.id, token: login.body.data.access_token };
  }

  // 100.00 per seat, monthly, minimum 2 seats, 10% tax.
  async function fixture() {
    const admin = await account('admin@discount.test', 'ADMIN');
    const staff = await account('staff@discount.test', 'STAFF');
    const customer = await account('customer@discount.test', 'CUSTOMER');
    const product = await call('POST', '/api/products', { token: admin.token, body: { name: 'Workspace', sale_price: '100.00' } });
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
    const tax = await call('POST', '/api/taxes', { token: admin.token, body: { name: 'Standard tax', rate_percent: '10.00' } });
    return { admin, staff, customer, plan: plan.body.data, tax: tax.body.data };
  }

  async function createRule(f, overrides = {}) {
    const res = await call('POST', '/api/discount-rules', {
      token: f.admin.token,
      body: {
        name: 'Three-seat 10%',
        value: '10.00',
        minimum_quantity: 3,
        starts_on: '2026-10-01',
        ends_on: '2026-12-31',
        usage_limit: null,
        enabled: true,
        ...overrides,
      },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.data;
  }

  async function subscribe(f, quantity = 3, startDate = '2026-10-01') {
    const res = await call('POST', '/api/subscriptions', {
      token: f.admin.token,
      body: { customer_id: f.customer.id, plan_id: f.plan.id, tax_id: f.tax.id, quantity, start_date: startDate },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    for (const action of ['confirm', 'activate']) {
      await call('POST', `/api/subscriptions/${res.body.data.id}/${action}`, { token: f.admin.token });
    }
    return res.body.data;
  }

  async function runOn(f, asOf) {
    const res = await call('POST', '/api/billing/run', { token: f.admin.token, body: { as_of: asOf } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body.data;
  }

  async function invoicesFor(f, subscriptionId) {
    const res = await call('GET', `/api/invoices?subscription_id=${subscriptionId}`, { token: f.admin.token });
    return res.body.data.sort((a, b) => a.period_start.localeCompare(b.period_start));
  }

  async function ruleRow(ruleId) {
    const { rows } = await db.query('SELECT times_used FROM discount_rules WHERE id = $1', [ruleId]);
    return rows[0].times_used;
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
      'TRUNCATE invoices, subscriptions, taxes, discount_rules, plans, product_variants, products, users RESTART IDENTITY CASCADE',
    );
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  });

  describe('managing rules (admins only)', () => {
    test('an admin creates a rule with zero uses so far', async () => {
      const f = await fixture();
      const rule = await createRule(f);
      assert.equal(rule.value, '10.00');
      assert.equal(rule.times_used, 0);
      assert.equal(rule.enabled, true);
    });

    test('staff and customers cannot create or read rules', async () => {
      const f = await fixture();
      const body = { name: 'X', value: '5.00', starts_on: '2026-10-01' };
      assert.equal((await call('POST', '/api/discount-rules', { token: f.staff.token, body })).status, 403);
      assert.equal((await call('POST', '/api/discount-rules', { token: f.customer.token, body })).status, 403);
      assert.equal((await call('GET', '/api/discount-rules', { token: f.staff.token })).status, 403);
    });

    test('rejects invalid percentages, end dates before start dates, and zero usage limits', async () => {
      const f = await fixture();
      const bad = async (overrides) =>
        call('POST', '/api/discount-rules', {
          token: f.admin.token,
          body: { name: 'X', value: '10.00', starts_on: '2026-10-01', ...overrides },
        });
      assert.ok((await bad({ value: '150.00' })).body.error.details.value);
      assert.ok((await bad({ value: '0' })).body.error.details.value);
      assert.ok((await bad({ ends_on: '2026-09-30' })).body.error.details.ends_on);
      assert.ok((await bad({ usage_limit: 0 })).body.error.details.usage_limit);
    });

    test('a partial update keeps the other fields', async () => {
      const f = await fixture();
      const rule = await createRule(f, { minimum_quantity: 4 });
      const res = await call('PATCH', `/api/discount-rules/${rule.id}`, { token: f.admin.token, body: { name: 'Renamed' } });
      assert.equal(res.body.data.name, 'Renamed');
      assert.equal(res.body.data.minimum_quantity, 4);
      assert.equal(res.body.data.value, '10.00');
    });
  });

  describe('applied at invoice generation', () => {
    test('a qualifying subscription gets 10% off before tax: 300 -> 270 -> 27 tax -> 297 total', async () => {
      const f = await fixture();
      const rule = await createRule(f);
      const sub = await subscribe(f, 3);
      await runOn(f, '2026-10-15');

      const [invoice] = await invoicesFor(f, sub.id);
      assert.equal(invoice.subtotal, '300.00');
      assert.equal(invoice.discount_rule_id, rule.id);
      assert.equal(invoice.discount_percent, '10.00');
      assert.equal(invoice.discount_amount, '30.00');
      assert.equal(invoice.tax_amount, '27.00', 'tax is on the discounted amount');
      assert.equal(invoice.total, '297.00');
    });

    test('a discount applies to the next invoice automatically, and not to earlier ones', async () => {
      const f = await fixture();
      const sub = await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      await createRule(f, { starts_on: '2026-01-01' });
      await runOn(f, '2026-11-15');

      const [october, november] = await invoicesFor(f, sub.id);
      assert.equal(october.discount_rule_id, null, 'October was generated before the rule existed');
      assert.equal(october.total, '330.00', 'not retroactive');
      assert.equal(november.discount_amount, '30.00');
      assert.equal(november.total, '297.00');
    });

    test('a rule that is not yet started does not apply to an earlier period (acceptance: window)', async () => {
      const f = await fixture();
      await createRule(f, { starts_on: '2026-11-01' });
      const sub = await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      const [invoice] = await invoicesFor(f, sub.id);
      assert.equal(invoice.discount_rule_id, null);
      assert.equal(invoice.total, '330.00');
    });
  });

  describe('rules that must not apply (acceptance tests 7, 8, 9)', () => {
    test('below-minimum: a 2-seat subscription does not get a 3-seat rule', async () => {
      const f = await fixture();
      await createRule(f);
      const sub = await subscribe(f, 2);
      await runOn(f, '2026-10-15');
      const [invoice] = await invoicesFor(f, sub.id);
      assert.equal(invoice.discount_rule_id, null);
      assert.equal(invoice.discount_amount, '0.00');
      assert.equal(invoice.total, '220.00');
    });

    test('expired: October is discounted, but November is not, because the window ended on 31 October', async () => {
      const f = await fixture();
      const rule = await createRule(f, { ends_on: '2026-10-31' });
      const sub = await subscribe(f, 3, '2026-10-01');
      await runOn(f, '2026-11-15');

      const [october, november] = await invoicesFor(f, sub.id);
      assert.equal(october.discount_rule_id, rule.id);
      assert.equal(november.discount_rule_id, null, 'expired rule must not apply');
      assert.equal(november.total, '330.00');
    });

    test('exhausted: a rule with a limit of 2 is applied to exactly 2 invoices', async () => {
      const f = await fixture();
      const rule = await createRule(f, { usage_limit: 2 });
      const subs = [await subscribe(f, 3), await subscribe(f, 3), await subscribe(f, 3)];
      await runOn(f, '2026-10-15');

      const discounted = [];
      for (const sub of subs) {
        const [invoice] = await invoicesFor(f, sub.id);
        discounted.push(invoice.discount_rule_id === rule.id);
      }
      assert.deepEqual(discounted.sort(), [false, true, true], 'only two invoices get the discount');
      assert.equal(await ruleRow(rule.id), 2);

      const fetched = await call('GET', `/api/discount-rules/${rule.id}`, { token: f.admin.token });
      assert.equal(fetched.body.data.times_used, 2);
    });

    test('exhausted: lowering the usage limit below the uses already made is rejected', async () => {
      const f = await fixture();
      const rule = await createRule(f, { usage_limit: 5 });
      await subscribe(f, 3);
      await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      const res = await call('PATCH', `/api/discount-rules/${rule.id}`, { token: f.admin.token, body: { usage_limit: 1 } });
      assert.equal(res.status, 422);
      assert.match(res.body.error.details.usage_limit, /at least 2/);
    });

    test('disabled: a rule switched off is never applied', async () => {
      const f = await fixture();
      const rule = await createRule(f);
      await call('PATCH', `/api/discount-rules/${rule.id}`, { token: f.admin.token, body: { enabled: false } });
      const sub = await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      const [invoice] = await invoicesFor(f, sub.id);
      assert.equal(invoice.discount_rule_id, null);
    });
  });

  describe('usage accounting', () => {
    test('re-running the batch does not use up the discount again', async () => {
      const f = await fixture();
      const rule = await createRule(f, { usage_limit: 10 });
      await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      await runOn(f, '2026-10-15');
      await runOn(f, '2026-10-15');
      assert.equal(await ruleRow(rule.id), 1);
    });

    test('a failed run leaves the usage count unchanged, so the retry is complete (acceptance test 12)', async () => {
      const f = await fixture();
      const rule = await createRule(f, { usage_limit: 1 });
      const first = await subscribe(f, 3);
      const second = await subscribe(f, 3);

      await assert.rejects(
        runBilling(db, {
          asOf: '2026-10-15',
          afterInvoiceCreated: (count) => {
            if (count === 2) throw new Error('simulated failure after the first discount was used');
          },
        }),
        /simulated failure/,
      );

      assert.equal(await ruleRow(rule.id), 0, 'the failed run must not consume the discount');
      const { rows } = await db.query('SELECT count(*)::int AS n FROM invoices');
      assert.equal(rows[0].n, 0);

      await runBilling(db, { asOf: '2026-10-15' });
      const discounted = [];
      for (const sub of [first, second]) {
        discounted.push((await invoicesFor(f, sub.id))[0].discount_rule_id === rule.id);
      }
      assert.deepEqual(discounted.sort(), [false, true], 'exactly one invoice is discounted after the retry');
      assert.equal(await ruleRow(rule.id), 1);
    });
  });

  describe('choosing between rules', () => {
    test('two eligible rules do not stack: the higher percentage applies alone', async () => {
      const f = await fixture();
      await createRule(f, { name: 'Ten percent', value: '10.00' });
      const fifteen = await createRule(f, { name: 'Fifteen percent', value: '15.00' });
      const sub = await subscribe(f, 3);
      await runOn(f, '2026-10-15');
      const [invoice] = await invoicesFor(f, sub.id);
      assert.equal(invoice.discount_rule_id, fifteen.id);
      assert.equal(invoice.discount_amount, '45.00');
      assert.equal(invoice.total, '280.50', '255.00 taxable + 25.50 tax');
    });
  });
});
