import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PASSWORD_RULES,
  validateSignup,
  validateLogin,
  validateProduct,
  validateVariant,
  validatePlan,
  isRealDate,
  isMoney,
  hasErrors,
} from '../src/lib/validation.js';
import { toCents, formatCents, addMoney } from '../src/lib/money.js';

const goodSignup = {
  fullName: 'Asha Rao',
  email: 'asha@example.com',
  password: 'Example!Pass9',
  confirmPassword: 'Example!Pass9',
};

describe('password rules match the problem statement', () => {
  const passes = (password) => PASSWORD_RULES.every((rule) => rule.test(password));

  test('accepts a password with every class of character and more than 8 characters', () => {
    assert.equal(passes('Example!Pass9'), true);
  });

  test('rejects exactly 8 characters', () => {
    assert.equal(passes('Abcdef!1'), false);
  });

  test('requires uppercase, lowercase, and a special character', () => {
    assert.equal(passes('example!pass9'), false, 'no uppercase');
    assert.equal(passes('EXAMPLE!PASS9'), false, 'no lowercase');
    assert.equal(passes('ExamplePass9'), false, 'no special character');
  });
});

describe('sign-up validation', () => {
  test('accepts a complete, valid form', () => {
    assert.equal(hasErrors(validateSignup(goodSignup)), false);
  });

  test('reports a missing name and an invalid email', () => {
    const errors = validateSignup({ ...goodSignup, fullName: '  ', email: 'not-an-email' });
    assert.ok(errors.fullName);
    assert.ok(errors.email);
  });

  test('reports a password that breaks any rule', () => {
    assert.ok(validateSignup({ ...goodSignup, password: 'short', confirmPassword: 'short' }).password);
  });

  test('reports mismatched confirmation', () => {
    assert.equal(
      validateSignup({ ...goodSignup, confirmPassword: 'Different!Pass9' }).confirmPassword,
      'Passwords do not match',
    );
  });
});

describe('login validation', () => {
  test('requires an email and a password', () => {
    const errors = validateLogin({ email: '', password: '' });
    assert.ok(errors.email);
    assert.ok(errors.password);
  });

  test('accepts any non-empty password, because rules apply only at sign-up', () => {
    assert.equal(hasErrors(validateLogin({ email: 'a@b.co', password: 'x' })), false);
  });
});

describe('product validation', () => {
  const valid = { name: 'Workspace', type: 'SERVICE', sale_price: '100.00', cost_price: '', notes: '' };

  test('accepts a product with an optional cost price left blank', () => {
    assert.equal(hasErrors(validateProduct(valid)), false);
  });

  test('requires a name and a sale price', () => {
    const errors = validateProduct({ ...valid, name: '', sale_price: '' });
    assert.ok(errors.name);
    assert.ok(errors.sale_price);
  });

  test('rejects negative and over-precise prices', () => {
    assert.ok(validateProduct({ ...valid, sale_price: '-5' }).sale_price);
    assert.ok(validateProduct({ ...valid, sale_price: '10.005' }).sale_price);
    assert.ok(validateProduct({ ...valid, cost_price: 'abc' }).cost_price);
  });
});

describe('variant validation', () => {
  test('accepts the Odoo brand variant with +560', () => {
    assert.equal(hasErrors(validateVariant({ attribute: 'Brand', value: 'Odoo', price_extra: '560.00' })), false);
  });

  test('allows a blank price extra, which means zero', () => {
    assert.equal(hasErrors(validateVariant({ attribute: 'Brand', value: 'Odoo', price_extra: '' })), false);
  });

  test('requires an attribute and a value', () => {
    const errors = validateVariant({ attribute: '', value: '', price_extra: '' });
    assert.ok(errors.attribute);
    assert.ok(errors.value);
  });
});

describe('plan validation', () => {
  const valid = {
    name: 'Monthly Workspace',
    product_variant_id: '6f1c2e0a-3b4d-4e5f-8a9b-0c1d2e3f4a5b',
    billing_interval: 'MONTH',
    minimum_quantity: '2',
    end_behavior: 'AUTO_CLOSE',
    available_from: '',
    available_to: '',
  };

  test('accepts a monthly plan with a minimum quantity', () => {
    assert.equal(hasErrors(validatePlan(valid)), false);
  });

  test('requires a variant', () => {
    assert.ok(validatePlan({ ...valid, product_variant_id: '' }).product_variant_id);
  });

  test('rejects a minimum quantity below 1 or not a whole number', () => {
    assert.ok(validatePlan({ ...valid, minimum_quantity: '0' }).minimum_quantity);
    assert.ok(validatePlan({ ...valid, minimum_quantity: '1.5' }).minimum_quantity);
    assert.ok(validatePlan({ ...valid, minimum_quantity: '' }).minimum_quantity);
  });

  test('rejects availability that ends before it starts', () => {
    const errors = validatePlan({ ...valid, available_from: '2026-06-01', available_to: '2026-05-31' });
    assert.equal(errors.available_to, 'Must be on or after the start date');
  });

  test('accepts availability on a single day', () => {
    assert.equal(hasErrors(validatePlan({ ...valid, available_from: '2026-06-01', available_to: '2026-06-01' })), false);
  });

  test('rejects impossible calendar dates', () => {
    assert.equal(isRealDate('2026-02-30'), false);
    assert.equal(isRealDate('2028-02-29'), true);
  });
});

describe('money helpers (integer cents, no float drift)', () => {
  test('parses and formats decimal strings', () => {
    assert.equal(toCents('100.00'), 10000);
    assert.equal(toCents('0.10'), 10);
    assert.equal(formatCents(66000), '660.00');
  });

  test('adds prices exactly, as in 100.00 + 560.00', () => {
    assert.equal(addMoney('100.00', '560.00'), '660.00');
    assert.equal(addMoney('0.10', '0.20'), '0.30');
  });

  test('isMoney accepts two decimals at most', () => {
    assert.equal(isMoney('12.5'), true);
    assert.equal(isMoney('12.345'), false);
  });
});
