import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDb } from '../../src/db.js';
import { runMigrations } from '../../src/migrate.js';
import { createAuthenticator } from '../../src/middleware/authenticate.js';

// Runs against a real PostgreSQL. Skipped unless TEST_DATABASE_URL is set.
// The suite truncates the users table, so the database name must contain "test".
const url = process.env.TEST_DATABASE_URL;
const JWT_SECRET = 'integration-test-secret-value';
const PASSWORD = 'Example!Pass9';

describe('auth and roles (integration)', { skip: url ? false : 'TEST_DATABASE_URL is not set' }, () => {
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

  async function signupAndLogin(email, password = PASSWORD, name = 'Test User') {
    const signup = await call('POST', '/api/auth/signup', { body: { name, email, password } });
    assert.equal(signup.status, 201, JSON.stringify(signup.body));
    const login = await call('POST', '/api/auth/login', { body: { email, password } });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    return { user: signup.body.data, token: login.body.data.access_token };
  }

  // Makes an admin directly in the database, as the create-admin script does.
  async function makeAdmin(email) {
    const { user, token } = await signupAndLogin(email);
    await db.query("UPDATE users SET role = 'ADMIN' WHERE id = $1", [user.id]);
    return { user, token };
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
    await db.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  });

  test('refuses to run against a database that is not a test database', () => {
    assert.match(new URL(url).pathname.slice(1), /test/i);
  });

  describe('sign-up', () => {
    test('creates a CUSTOMER and never returns the password hash', async () => {
      const res = await call('POST', '/api/auth/signup', {
        body: { name: 'Asha', email: 'Asha@Example.com', password: PASSWORD },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.role, 'CUSTOMER');
      assert.equal(res.body.data.email, 'asha@example.com');
      assert.equal(res.body.data.password_hash, undefined);
      assert.equal(JSON.stringify(res.body).includes('$2'), false, 'hash must not leak');
    });

    test('rejects a weak password with per-field details', async () => {
      const res = await call('POST', '/api/auth/signup', {
        body: { name: 'Asha', email: 'asha@example.com', password: 'weakpass' },
      });
      assert.equal(res.status, 422);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.password);
    });

    test('blocks a duplicate email, ignoring case, with 409', async () => {
      await call('POST', '/api/auth/signup', { body: { name: 'A', email: 'dup@example.com', password: PASSWORD } });
      const res = await call('POST', '/api/auth/signup', {
        body: { name: 'B', email: 'DUP@example.com', password: PASSWORD },
      });
      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
      assert.ok(res.body.error.details.email);
    });

    test('ignores a client-supplied role', async () => {
      const res = await call('POST', '/api/auth/signup', {
        body: { name: 'Sneaky', email: 'sneaky@example.com', password: PASSWORD, role: 'ADMIN' },
      });
      assert.equal(res.status, 422, 'unknown field role must be rejected, not silently accepted');
    });
  });

  describe('login and tokens', () => {
    test('returns a bearer token and the user, matching docs/api.md', async () => {
      await call('POST', '/api/auth/signup', { body: { name: 'Asha', email: 'asha@example.com', password: PASSWORD } });
      const res = await call('POST', '/api/auth/login', {
        body: { email: 'asha@example.com', password: PASSWORD },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.token_type, 'Bearer');
      assert.equal(typeof res.body.data.access_token, 'string');
      assert.equal(res.body.data.user.role, 'CUSTOMER');
      assert.equal(res.body.data.user.password_hash, undefined);
    });

    test('wrong password and unknown email get the same 401 response', async () => {
      await call('POST', '/api/auth/signup', { body: { name: 'Asha', email: 'asha@example.com', password: PASSWORD } });
      const wrongPassword = await call('POST', '/api/auth/login', {
        body: { email: 'asha@example.com', password: 'Wrong!Password1' },
      });
      const unknownEmail = await call('POST', '/api/auth/login', {
        body: { email: 'nobody@example.com', password: PASSWORD },
      });
      assert.equal(wrongPassword.status, 401);
      assert.equal(unknownEmail.status, 401);
      assert.deepEqual(wrongPassword.body, unknownEmail.body);
    });

    test('GET /auth/me returns the signed-in user', async () => {
      const { token, user } = await signupAndLogin('me@example.com');
      const res = await call('GET', '/api/auth/me', { token });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.id, user.id);
    });

    test('GET /auth/me without a token returns 401', async () => {
      assert.equal((await call('GET', '/api/auth/me')).status, 401);
    });

    test('a malformed or forged token returns 401', async () => {
      assert.equal((await call('GET', '/api/auth/me', { token: 'not.a.jwt' })).status, 401);
    });

    test('a token signed with another secret is rejected', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const forged = jwt.sign({ role: 'ADMIN' }, 'some-other-secret-value', { subject: 'x' });
      assert.equal((await call('GET', '/api/auth/me', { token: forged })).status, 401);
    });

    test('a token for a deleted account is rejected', async () => {
      const { token, user } = await signupAndLogin('gone@example.com');
      await db.query('DELETE FROM users WHERE id = $1', [user.id]);
      assert.equal((await call('GET', '/api/auth/me', { token })).status, 401);
    });
  });

  describe('role middleware', () => {
    test('customers cannot write to the catalog, even with a valid token', async () => {
      const { token } = await signupAndLogin('cust@example.com');
      const res = await call('POST', '/api/products', {
        token,
        body: { name: 'Nope', sale_price: '1.00' },
      });
      assert.equal(res.status, 403);
    });

    test('customers can read the catalog', async () => {
      const { token } = await signupAndLogin('reader@example.com');
      assert.equal((await call('GET', '/api/products', { token })).status, 200);
    });

    test('a role change takes effect on the next request, without a new login', async () => {
      const { token: customerToken } = await signupAndLogin('promote@example.com');
      const { token: adminToken } = await makeAdmin('boss@example.com');
      const customer = await db.query("SELECT id FROM users WHERE email = 'promote@example.com'");

      assert.equal(
        (await call('POST', '/api/products', { token: customerToken, body: { name: 'X', sale_price: '1.00' } })).status,
        403,
      );

      const promote = await call('PATCH', `/api/users/${customer.rows[0].id}/role`, {
        token: adminToken,
        body: { role: 'STAFF' },
      });
      assert.equal(promote.status, 200);
      assert.equal(promote.body.data.role, 'STAFF');

      assert.equal(
        (await call('POST', '/api/products', { token: customerToken, body: { name: 'X', sale_price: '1.00' } })).status,
        201,
      );
    });
  });

  describe('admin account management', () => {
    test('only admins can list users', async () => {
      const { token: customerToken } = await signupAndLogin('c@example.com');
      const { token: adminToken } = await makeAdmin('a@example.com');
      assert.equal((await call('GET', '/api/users', { token: customerToken })).status, 403);
      const list = await call('GET', '/api/users?page_size=10', { token: adminToken });
      assert.equal(list.status, 200);
      assert.equal(list.body.meta.total, 2);
      assert.equal(list.body.data[0].password_hash, undefined);
    });

    test('an admin creates a Staff member directly', async () => {
      const { token: adminToken } = await makeAdmin('admin2@example.com');
      const res = await call('POST', '/api/users', {
        token: adminToken,
        body: { name: 'Staff Member', email: 'staff@example.com', password: PASSWORD, role: 'STAFF' },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.role, 'STAFF');
    });

    test('an admin cannot remove their own admin role', async () => {
      const { token, user } = await makeAdmin('solo@example.com');
      const res = await call('PATCH', `/api/users/${user.id}/role`, { token, body: { role: 'CUSTOMER' } });
      assert.equal(res.status, 422);
      assert.ok(res.body.error.details.role);
    });

    test('role changes for an unknown user return 404', async () => {
      const { token } = await makeAdmin('admin3@example.com');
      const res = await call('PATCH', '/api/users/00000000-0000-4000-8000-000000000000/role', {
        token,
        body: { role: 'STAFF' },
      });
      assert.equal(res.status, 404);
    });
  });
});
