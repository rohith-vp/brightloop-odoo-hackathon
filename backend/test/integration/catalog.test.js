import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDb } from '../../src/db.js';
import { runMigrations } from '../../src/migrate.js';

// Runs against a real PostgreSQL. Skipped unless TEST_DATABASE_URL is set.
// The suite truncates tables, so the database name must contain "test".
const url = process.env.TEST_DATABASE_URL;
const NOT_FOUND_ID = '00000000-0000-4000-8000-000000000000';

function testAuth(req, res, next) {
  const role = req.get('x-test-role');
  if (role) req.user = { id: `user-${role.toLowerCase()}`, role };
  next();
}

describe('catalog endpoints (integration)', { skip: url ? false : 'TEST_DATABASE_URL is not set' }, () => {
  let db;
  let server;
  let base;

  async function call(method, path, { role, body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (role) headers['x-test-role'] = role;
    const res = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = res.status === 204 ? null : await res.json();
    return { status: res.status, body: json };
  }

  // Creates a product with a variant, and returns their ids.
  async function seedProductWithVariant(overrides = {}) {
    const product = await call('POST', '/api/products', {
      role: 'ADMIN',
      body: { name: 'Workspace', type: 'SERVICE', sale_price: '100.00', ...overrides },
    });
    const variant = await call('POST', `/api/products/${product.body.data.id}/variants`, {
      role: 'ADMIN',
      body: { attribute: 'Brand', value: 'Odoo', price_extra: '560.00' },
    });
    return { product: product.body.data, variant: variant.body.data };
  }

  before(async () => {
    db = createDb(url);
    await runMigrations(db);
    const app = createApp({ db, corsOrigins: [], authenticate: testAuth });
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await db.query('TRUNCATE plans, product_variants, products RESTART IDENTITY CASCADE');
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  });

  test('refuses to run against a database that is not a test database', () => {
    const name = new URL(url).pathname.slice(1);
    assert.match(name, /test/i, 'TEST_DATABASE_URL must point at a database whose name contains "test"');
  });

  describe('access control', () => {
    test('signed-out users get 401 on the catalog', async () => {
      assert.equal((await call('GET', '/api/products')).status, 401);
      assert.equal((await call('GET', '/api/plans')).status, 401);
    });

    test('customers can read the catalog but not change it', async () => {
      const { product } = await seedProductWithVariant();
      assert.equal((await call('GET', '/api/products', { role: 'CUSTOMER' })).status, 200);
      assert.equal((await call('GET', `/api/products/${product.id}`, { role: 'CUSTOMER' })).status, 200);
      const write = await call('POST', '/api/products', {
        role: 'CUSTOMER',
        body: { name: 'Nope', sale_price: '1.00' },
      });
      assert.equal(write.status, 403);
    });

    test('staff can create and change products', async () => {
      const res = await call('POST', '/api/products', {
        role: 'STAFF',
        body: { name: 'Staff product', sale_price: '5.00' },
      });
      assert.equal(res.status, 201);
    });
  });

  describe('products', () => {
    test('creates a product with an empty variants list', async () => {
      const res = await call('POST', '/api/products', {
        role: 'ADMIN',
        body: { name: 'Workspace', type: 'SERVICE', sale_price: '100.00', cost_price: '40.00', notes: 'Core' },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.name, 'Workspace');
      assert.equal(res.body.data.sale_price, '100.00');
      assert.equal(res.body.data.cost_price, '40.00');
      assert.deepEqual(res.body.data.variants, []);
    });

    test('rejects invalid product input with per-field details', async () => {
      const res = await call('POST', '/api/products', {
        role: 'ADMIN',
        body: { name: '', sale_price: '-1.00', colour: 'red' },
      });
      assert.equal(res.status, 422);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.name);
      assert.ok(res.body.error.details.sale_price);
      assert.equal(res.body.error.details.colour, 'Unknown field.');
    });

    test('lists products with pagination metadata', async () => {
      await call('POST', '/api/products', { role: 'ADMIN', body: { name: 'A', sale_price: '1.00' } });
      await call('POST', '/api/products', { role: 'ADMIN', body: { name: 'B', sale_price: '1.00' } });
      await call('POST', '/api/products', { role: 'ADMIN', body: { name: 'C', sale_price: '1.00' } });

      const page1 = await call('GET', '/api/products?page=1&page_size=2', { role: 'CUSTOMER' });
      assert.equal(page1.status, 200);
      assert.equal(page1.body.data.length, 2);
      assert.deepEqual(page1.body.meta, { page: 1, page_size: 2, total: 3 });

      const page2 = await call('GET', '/api/products?page=2&page_size=2', { role: 'CUSTOMER' });
      assert.equal(page2.body.data.length, 1);
      assert.equal(page2.body.meta.total, 3);
    });

    test('rejects an oversized page size', async () => {
      const res = await call('GET', '/api/products?page_size=500', { role: 'ADMIN' });
      assert.equal(res.status, 422);
    });

    test('detail includes variants', async () => {
      const { product, variant } = await seedProductWithVariant();
      const res = await call('GET', `/api/products/${product.id}`, { role: 'CUSTOMER' });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.variants.length, 1);
      assert.equal(res.body.data.variants[0].id, variant.id);
    });

    test('returns 404 for an unknown or malformed id', async () => {
      assert.equal((await call('GET', `/api/products/${NOT_FOUND_ID}`, { role: 'ADMIN' })).status, 404);
      assert.equal((await call('GET', '/api/products/not-a-uuid', { role: 'ADMIN' })).status, 404);
    });

    test('PATCH changes only the given fields', async () => {
      const { product } = await seedProductWithVariant();
      const res = await call('PATCH', `/api/products/${product.id}`, {
        role: 'ADMIN',
        body: { sale_price: '120.00' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.sale_price, '120.00');
      assert.equal(res.body.data.name, 'Workspace');
      assert.equal(res.body.data.variants.length, 1);
    });

    test('PATCH with an empty body is rejected', async () => {
      const { product } = await seedProductWithVariant();
      const res = await call('PATCH', `/api/products/${product.id}`, { role: 'ADMIN', body: {} });
      assert.equal(res.status, 422);
    });

    test('deleting a product removes its variants', async () => {
      const { product, variant } = await seedProductWithVariant();
      const del = await call('DELETE', `/api/products/${product.id}`, { role: 'ADMIN' });
      assert.equal(del.status, 204);
      const gone = await call('GET', `/api/products/${product.id}/variants`, { role: 'ADMIN' });
      assert.equal(gone.status, 404);
      const rows = await db.query('SELECT 1 FROM product_variants WHERE id = $1', [variant.id]);
      assert.equal(rows.rowCount, 0);
    });

    test('deleting a product that a plan uses returns 409 and keeps the product', async () => {
      const { product, variant } = await seedProductWithVariant();
      await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'Monthly',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          minimum_quantity: 2,
          end_behavior: 'AUTO_CLOSE',
        },
      });
      const res = await call('DELETE', `/api/products/${product.id}`, { role: 'ADMIN' });
      assert.equal(res.status, 409);
      assert.equal((await call('GET', `/api/products/${product.id}`, { role: 'ADMIN' })).status, 200);
    });
  });

  describe('variants', () => {
    test('adds the Odoo brand variant with +560', async () => {
      const { variant } = await seedProductWithVariant();
      assert.equal(variant.attribute, 'Brand');
      assert.equal(variant.value, 'Odoo');
      assert.equal(variant.price_extra, '560.00');
    });

    test('defaults price_extra to 0.00 when omitted', async () => {
      const product = await call('POST', '/api/products', { role: 'ADMIN', body: { name: 'P', sale_price: '1.00' } });
      const res = await call('POST', `/api/products/${product.body.data.id}/variants`, {
        role: 'ADMIN',
        body: { attribute: 'Size', value: 'Small' },
      });
      assert.equal(res.body.data.price_extra, '0.00');
    });

    test('the same attribute and value cannot be added twice to one product', async () => {
      const { product } = await seedProductWithVariant();
      const res = await call('POST', `/api/products/${product.id}/variants`, {
        role: 'ADMIN',
        body: { attribute: 'Brand', value: 'Odoo', price_extra: '10.00' },
      });
      assert.equal(res.status, 409);
    });

    test('adding a variant to an unknown product returns 404', async () => {
      const res = await call('POST', `/api/products/${NOT_FOUND_ID}/variants`, {
        role: 'ADMIN',
        body: { attribute: 'Brand', value: 'X' },
      });
      assert.equal(res.status, 404);
    });

    test('PATCH keeps price_extra when only the value changes (regression)', async () => {
      const { variant } = await seedProductWithVariant();
      const res = await call('PATCH', `/api/variants/${variant.id}`, {
        role: 'ADMIN',
        body: { value: 'Odoo Enterprise' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.value, 'Odoo Enterprise');
      assert.equal(res.body.data.price_extra, '560.00');
    });

    test('deleting a variant used by a plan returns 409', async () => {
      const { variant } = await seedProductWithVariant();
      await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'Monthly',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          end_behavior: 'AUTO_CLOSE',
        },
      });
      assert.equal((await call('DELETE', `/api/variants/${variant.id}`, { role: 'ADMIN' })).status, 409);
    });

    test('deleting an unused variant returns 204', async () => {
      const { variant } = await seedProductWithVariant();
      assert.equal((await call('DELETE', `/api/variants/${variant.id}`, { role: 'ADMIN' })).status, 204);
    });
  });

  describe('plans', () => {
    test('creates a monthly plan and computes unit price from product plus variant (100 + 560)', async () => {
      const { variant } = await seedProductWithVariant();
      const res = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'Monthly Workspace',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          minimum_quantity: 2,
          end_behavior: 'AUTO_CLOSE',
          available_from: '2026-01-01',
        },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.billing_interval, 'MONTH');
      assert.equal(res.body.data.minimum_quantity, 2);
      assert.equal(res.body.data.unit_price, '660.00');
      assert.equal(res.body.data.available_from, '2026-01-01');
      assert.equal(res.body.data.available_to, null);
      assert.equal(res.body.data.product_id, variant.product_id);
    });

    test('minimum quantity defaults to 1', async () => {
      const { variant } = await seedProductWithVariant();
      const res = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: { name: 'P', product_variant_id: variant.id, billing_interval: 'YEAR', end_behavior: 'MANUAL_CLOSE' },
      });
      assert.equal(res.body.data.minimum_quantity, 1);
    });

    test('rejects availability that ends before it starts', async () => {
      const { variant } = await seedProductWithVariant();
      const res = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'P',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          end_behavior: 'AUTO_CLOSE',
          available_from: '2026-06-01',
          available_to: '2026-05-01',
        },
      });
      assert.equal(res.status, 422);
      assert.ok(res.body.error.details.available_to);
    });

    test('rejects a plan for a variant that does not exist, with a field error', async () => {
      const res = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'P',
          product_variant_id: NOT_FOUND_ID,
          billing_interval: 'MONTH',
          end_behavior: 'AUTO_CLOSE',
        },
      });
      assert.equal(res.status, 422);
      assert.equal(res.body.error.details.product_variant_id, 'Product variant does not exist.');
    });

    test('lists plans with pagination and filters by variant', async () => {
      const first = await seedProductWithVariant({ name: 'First' });
      const second = await seedProductWithVariant({ name: 'Second' });
      const planBody = (name, variantId) => ({
        role: 'ADMIN',
        body: { name, product_variant_id: variantId, billing_interval: 'MONTH', end_behavior: 'AUTO_CLOSE' },
      });
      await call('POST', '/api/plans', planBody('Plan A', first.variant.id));
      await call('POST', '/api/plans', planBody('Plan B', second.variant.id));

      const all = await call('GET', '/api/plans?page_size=1', { role: 'CUSTOMER' });
      assert.equal(all.body.data.length, 1);
      assert.equal(all.body.meta.total, 2);

      const filtered = await call('GET', `/api/plans?product_variant_id=${first.variant.id}`, { role: 'CUSTOMER' });
      assert.equal(filtered.body.meta.total, 1);
      assert.equal(filtered.body.data[0].name, 'Plan A');
    });

    test('PATCH changes one field and keeps the others, including minimum quantity', async () => {
      const { variant } = await seedProductWithVariant();
      const created = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'Monthly',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          minimum_quantity: 3,
          end_behavior: 'AUTO_CLOSE',
        },
      });
      const res = await call('PATCH', `/api/plans/${created.body.data.id}`, {
        role: 'ADMIN',
        body: { name: 'Monthly (renamed)' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.name, 'Monthly (renamed)');
      assert.equal(res.body.data.minimum_quantity, 3);
      assert.equal(res.body.data.end_behavior, 'AUTO_CLOSE');
    });

    test('PATCH validates the merged dates, not just the new value', async () => {
      const { variant } = await seedProductWithVariant();
      const created = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: {
          name: 'Monthly',
          product_variant_id: variant.id,
          billing_interval: 'MONTH',
          end_behavior: 'AUTO_CLOSE',
          available_from: '2026-06-01',
          available_to: '2026-12-31',
        },
      });
      const res = await call('PATCH', `/api/plans/${created.body.data.id}`, {
        role: 'ADMIN',
        body: { available_from: '2027-01-01' },
      });
      assert.equal(res.status, 422);
      assert.ok(res.body.error.details.available_to);
    });

    test('PATCH to a new variant updates unit price', async () => {
      const { product } = await seedProductWithVariant();
      const cheap = await call('POST', `/api/products/${product.id}/variants`, {
        role: 'ADMIN',
        body: { attribute: 'Brand', value: 'Basic', price_extra: '0.00' },
      });
      const variants = (await call('GET', `/api/products/${product.id}/variants`, { role: 'ADMIN' })).body.data;
      const odoo = variants.find((v) => v.value === 'Odoo');
      const created = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: { name: 'P', product_variant_id: odoo.id, billing_interval: 'MONTH', end_behavior: 'AUTO_CLOSE' },
      });
      assert.equal(created.body.data.unit_price, '660.00');
      const res = await call('PATCH', `/api/plans/${created.body.data.id}`, {
        role: 'ADMIN',
        body: { product_variant_id: cheap.body.data.id },
      });
      assert.equal(res.body.data.unit_price, '100.00');
    });

    test('a plan that reaches a closed period can still be read and deleted', async () => {
      const { variant } = await seedProductWithVariant();
      const created = await call('POST', '/api/plans', {
        role: 'ADMIN',
        body: { name: 'Old', product_variant_id: variant.id, billing_interval: 'MONTH', end_behavior: 'MANUAL_CLOSE' },
      });
      const id = created.body.data.id;
      assert.equal((await call('GET', `/api/plans/${id}`, { role: 'CUSTOMER' })).status, 200);
      assert.equal((await call('DELETE', `/api/plans/${id}`, { role: 'ADMIN' })).status, 204);
      assert.equal((await call('GET', `/api/plans/${id}`, { role: 'ADMIN' })).status, 404);
    });

    test('returns 404 for an unknown plan', async () => {
      assert.equal((await call('GET', `/api/plans/${NOT_FOUND_ID}`, { role: 'ADMIN' })).status, 404);
      assert.equal((await call('DELETE', `/api/plans/${NOT_FOUND_ID}`, { role: 'ADMIN' })).status, 404);
    });
  });
});
