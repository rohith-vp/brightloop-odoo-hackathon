import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';

// A db that fails the test if it is ever called. Auth checks must run before any query.
const explodingDb = {
  query: async () => {
    throw new Error('db must not be reached for unauthorized requests');
  },
};

// Sets req.user from an x-test-role header, so tests can act as each role.
function testAuth(req, res, next) {
  const role = req.get('x-test-role');
  if (role) req.user = { id: 'test-user', role };
  next();
}

describe('catalog route guards (no database access)', () => {
  let server;
  let base;

  before(async () => {
    const app = createApp({ db: explodingDb, authenticate: testAuth });
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => server.close());

  const cases = [
    ['GET', '/api/products', undefined, 401],
    ['POST', '/api/products', { name: 'X', sale_price: '1.00' }, 401],
    ['GET', '/api/plans', undefined, 401],
    ['POST', '/api/plans', {}, 401],
    ['POST', '/api/products', { name: 'X', sale_price: '1.00' }, 403, 'CUSTOMER'],
    ['PATCH', '/api/products/6f1c2e0a-3b4d-4e5f-8a9b-0c1d2e3f4a5b', { name: 'X' }, 403, 'CUSTOMER'],
    ['POST', '/api/products/6f1c2e0a-3b4d-4e5f-8a9b-0c1d2e3f4a5b/variants', {}, 403, 'CUSTOMER'],
    ['DELETE', '/api/plans/6f1c2e0a-3b4d-4e5f-8a9b-0c1d2e3f4a5b', undefined, 403, 'CUSTOMER'],
  ];

  for (const [method, path, body, status, role] of cases) {
    test(`${method} ${path} ${role ? `as ${role}` : 'signed out'} returns ${status}`, async () => {
      const headers = { 'Content-Type': 'application/json' };
      if (role) headers['x-test-role'] = role;
      const res = await fetch(base + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      assert.equal(res.status, status);
    });
  }
});
