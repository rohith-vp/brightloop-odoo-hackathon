import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTax,
  validateTaxRule,
  parseMoney,
  formatMoney,
  parseRatePercent,
  percentOfCents,
  BillingValidationError,
} from '../src/index.js';

describe('money parsing and formatting', () => {
  test('parses decimal strings into cents without float error', () => {
    assert.equal(parseMoney('300.00'), 30000);
    assert.equal(parseMoney('0.10'), 10);
    assert.equal(parseMoney('0.30'), 30);
    assert.equal(parseMoney('100'), 10000);
    assert.equal(parseMoney('100.5'), 10050);
  });

  test('rejects negatives, extra precision, and non-strings', () => {
    assert.throws(() => parseMoney('-1.00'), BillingValidationError);
    assert.throws(() => parseMoney('1.234'), BillingValidationError);
    assert.throws(() => parseMoney(1.5), BillingValidationError);
    assert.throws(() => parseMoney(''), BillingValidationError);
  });

  test('formats cents with two decimal places', () => {
    assert.equal(formatMoney(33000), '330.00');
    assert.equal(formatMoney(5), '0.05');
    assert.equal(formatMoney(0), '0.00');
  });
});

describe('rate parsing', () => {
  test('converts percent strings to hundredths of a percent', () => {
    assert.equal(parseRatePercent('10.00'), 1000);
    assert.equal(parseRatePercent('10'), 1000);
    assert.equal(parseRatePercent('7.5'), 750);
    assert.equal(parseRatePercent('0'), 0);
    assert.equal(parseRatePercent('100.00'), 10000);
  });

  test('rejects rates above 100 or with too many decimals', () => {
    assert.throws(() => parseRatePercent('100.01'), BillingValidationError);
    assert.throws(() => parseRatePercent('-5'), BillingValidationError);
    assert.throws(() => parseRatePercent('10.005'), BillingValidationError);
    assert.throws(() => parseRatePercent(10), BillingValidationError);
  });
});

describe('percentOfCents rounding (half up)', () => {
  test('exact results need no rounding', () => {
    assert.equal(percentOfCents(30000, 1000), 3000); // 300.00 at 10% = 30.00
  });

  test('rounds a half cent up', () => {
    // 0.05 at 50% = 0.025, which is 2.5 cents -> 3 cents (half up)
    assert.equal(percentOfCents(5, 5000), 3);
  });

  test('rounds a fraction below half down', () => {
    // 0.01 at 10% = 0.001 -> 0 cents
    assert.equal(percentOfCents(1, 1000), 0);
  });

  test('0% and 100% are exact', () => {
    assert.equal(percentOfCents(12345, 0), 0);
    assert.equal(percentOfCents(12345, 10000), 12345);
  });

  test('rejects invalid inputs', () => {
    assert.throws(() => percentOfCents(1.5, 1000), BillingValidationError);
    assert.throws(() => percentOfCents(-1, 1000), BillingValidationError);
    assert.throws(() => percentOfCents(100, 10001), BillingValidationError);
  });
});

describe('calculateTax (billing-rules.md §5 worked examples)', () => {
  test('3 seats at 100.00 with 10% tax: subtotal 300.00, tax 30.00', () => {
    const subtotal = parseMoney('300.00');
    assert.equal(formatMoney(calculateTax({ taxableCents: subtotal, ratePercent: '10.00' })), '30.00');
  });

  test('same subscription with a 10% discount: taxable 270.00, tax 27.00', () => {
    const taxable = parseMoney('270.00');
    assert.equal(formatMoney(calculateTax({ taxableCents: taxable, ratePercent: '10.00' })), '27.00');
  });

  test('invoice total from the worked examples: 330.00 and 297.00', () => {
    const withoutDiscount = parseMoney('300.00') + calculateTax({ taxableCents: parseMoney('300.00'), ratePercent: '10.00' });
    const withDiscount = parseMoney('270.00') + calculateTax({ taxableCents: parseMoney('270.00'), ratePercent: '10.00' });
    assert.equal(formatMoney(withoutDiscount), '330.00');
    assert.equal(formatMoney(withDiscount), '297.00');
  });

  test('zero-rate tax is zero', () => {
    assert.equal(calculateTax({ taxableCents: 99999, ratePercent: '0.00' }), 0);
  });

  test('fractional rate: 18.5% on 100.00 is 18.50', () => {
    assert.equal(formatMoney(calculateTax({ taxableCents: 10000, ratePercent: '18.5' })), '18.50');
  });

  test('a rounding edge is stable: 0.05 at 10% rounds to 0.01 (half up from 0.005)', () => {
    assert.equal(calculateTax({ taxableCents: 5, ratePercent: '10.00' }), 1);
  });
});

describe('validateTaxRule', () => {
  test('accepts a valid rule and trims the name', () => {
    assert.deepEqual(validateTaxRule({ name: '  Standard tax ', ratePercent: '10.00' }), {
      name: 'Standard tax',
      ratePercent: '10.00',
    });
  });

  test('reports every invalid field at once', () => {
    try {
      validateTaxRule({ name: '  ', ratePercent: '150' });
      assert.fail('expected validation error');
    } catch (err) {
      assert.ok(err instanceof BillingValidationError);
      assert.ok(err.details.name);
      assert.ok(err.details.rate_percent);
    }
  });
});
