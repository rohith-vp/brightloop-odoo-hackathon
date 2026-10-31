import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { signupSchema, loginSchema, passwordSchema } from '../../src/schemas/auth.js';

const GOOD = 'Example!Pass9';
const signup = (overrides = {}) => ({ name: 'Asha', email: 'asha@example.com', password: GOOD, ...overrides });

function passwordMessages(password) {
  const result = passwordSchema.safeParse(password);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe('password rules (problem statement: more than 8 characters, upper, lower, special)', () => {
  test('accepts a password that meets every rule', () => {
    assert.equal(passwordSchema.safeParse(GOOD).success, true);
  });

  test('rejects exactly 8 characters, because the rule is "more than eight"', () => {
    assert.ok(passwordMessages('Abcdef!1').some((m) => /more than 8/.test(m)));
  });

  test('accepts exactly 9 characters', () => {
    assert.equal(passwordSchema.safeParse('Abcdef!12').success, true);
  });

  test('requires an uppercase letter', () => {
    assert.ok(passwordMessages('abcdefgh!1').some((m) => /uppercase/.test(m)));
  });

  test('requires a lowercase letter', () => {
    assert.ok(passwordMessages('ABCDEFGH!1').some((m) => /lowercase/.test(m)));
  });

  test('requires a special character, and a digit alone does not count', () => {
    assert.ok(passwordMessages('Abcdefghi1').some((m) => /special character/.test(m)));
  });

  test('reports every unmet rule at once', () => {
    assert.equal(passwordMessages('abc').length, 3);
  });
});

describe('signup schema', () => {
  test('normalizes the email to lowercase and trims whitespace', () => {
    const parsed = signupSchema.parse(signup({ email: '  Asha@Example.COM ' }));
    assert.equal(parsed.email, 'asha@example.com');
  });

  test('rejects an invalid email', () => {
    const result = signupSchema.safeParse(signup({ email: 'not-an-email' }));
    assert.equal(result.success, false);
  });

  test('requires a name', () => {
    assert.equal(signupSchema.safeParse(signup({ name: '   ' })).success, false);
  });

  test('rejects unknown fields, so a client cannot set its own role', () => {
    assert.equal(signupSchema.safeParse(signup({ role: 'ADMIN' })).success, false);
  });
});

describe('login schema', () => {
  test('does not enforce password rules on login, so existing accounts still sign in', () => {
    assert.equal(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success, true);
  });
});
