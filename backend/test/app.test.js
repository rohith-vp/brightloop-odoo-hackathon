import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

// Fake DB: works like a healthy pool unless told to fail.
function fakeDb({ fail = false } = {}) {
  return {
    query: async () => {
      if (fail) throw new Error('connection refused');
      return { rows: [{ '?column?': 1 }] };
    },
  };
}

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

describe('config', () => {
  test('requires DATABASE_URL', () => {
    assert.throws(() => loadConfig({}), /DATABASE_URL is required/);
  });

  test('requires JWT_SECRET of at least 16 characters', () => {
    assert.throws(() => loadConfig({ DATABASE_URL: 'x' }), /JWT_SECRET is required/);
    assert.throws(
      () => loadConfig({ DATABASE_URL: 'x', JWT_SECRET: 'short' }),
      /at least 16 characters/,
    );
  });

  test('applies defaults and splits CORS origins', () => {
    const config = loadConfig({
      DATABASE_URL: 'postgresql://u:p@db:5432/x',
      JWT_SECRET: 'a-long-enough-test-secret',
      CORS_ORIGINS: 'http://a.test, http://b.test',
    });
    assert.equal(config.port, 8000);
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.jwtExpiresMinutes, 60);
    assert.deepEqual(config.corsOrigins, ['http://a.test', 'http://b.test']);
  });

  test('rejects an invalid port', () => {
    assert.throws(
      () => loadConfig({ DATABASE_URL: 'x', JWT_SECRET: 'a-long-enough-test-secret', API_PORT: 'abc' }),
      /API_PORT/,
    );
  });
});

describe('API server', () => {
  let healthy;
  let broken;

  before(async () => {
    healthy = await startServer(
      createApp({ db: fakeDb(), corsOrigins: ['http://localhost:5173'] }),
    );
    broken = await startServer(createApp({ db: fakeDb({ fail: true }) }));
  });

  after(() => {
    healthy.server.close();
    broken.server.close();
  });

  test('GET /api/health returns ok when the database responds', async () => {
    const res = await fetch(`${healthy.base}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { data: { status: 'ok', database: 'up' } });
  });

  test('GET /api/health returns 503 when the database is down', async () => {
    const res = await fetch(`${broken.base}/api/health`);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error.code, 'SERVICE_UNAVAILABLE');
  });

  test('unknown routes return the shared error shape', async () => {
    const res = await fetch(`${healthy.base}/api/nope`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
  });

  test('malformed JSON returns 400', async () => {
    const res = await fetch(`${healthy.base}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'MALFORMED_JSON');
  });

  test('CORS allows the configured frontend origin only', async () => {
    const allowed = await fetch(`${healthy.base}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');

    const other = await fetch(`${healthy.base}/api/health`, {
      headers: { Origin: 'http://evil.test' },
    });
    assert.equal(other.headers.get('access-control-allow-origin'), null);
  });
});
