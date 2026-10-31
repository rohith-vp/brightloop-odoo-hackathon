import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOUNT_REJECTIONS,
  discountRejections,
  selectDiscount,
  invoiceAmounts,
  BillingValidationError,
} from '../src/index.js';

const rule = (overrides = {}) => ({
  id: 'rule-10',
  percent: '10.00',
  minimumQuantity: 3,
  startsOn: '2026-10-01',
  endsOn: '2026-12-31',
  usageLimit: 100,
  timesUsed: 0,
  enabled: true,
  ...overrides,
});
const context = (overrides = {}) => ({ quantity: 3, billingDate: '2026-10-01', ...overrides });

describe('a rule that applies', () => {
  test('no rejection reasons when every condition holds', () => {
    assert.deepEqual(discountRejections(rule(), context()), []);
  });

  test('an open-ended rule (no end date) applies on any later date', () => {
    assert.deepEqual(discountRejections(rule({ endsOn: null }), context({ billingDate: '2030-01-01' })), []);
  });

  test('an unlimited rule (no usage limit) always has usage remaining', () => {
    assert.deepEqual(discountRejections(rule({ usageLimit: null, timesUsed: 999 }), context()), []);
  });
});

describe('expired rules (acceptance test 7)', () => {
  test('a rule is rejected for a billing date after its end date', () => {
    assert.deepEqual(
      discountRejections(rule({ endsOn: '2026-10-31' }), context({ billingDate: '2026-11-01' })),
      [DISCOUNT_REJECTIONS.EXPIRED],
    );
  });

  test('the end date itself is inside the window (inclusive)', () => {
    assert.deepEqual(discountRejections(rule({ endsOn: '2026-10-31' }), context({ billingDate: '2026-10-31' })), []);
  });

  test('a rule is rejected before its start date', () => {
    assert.deepEqual(
      discountRejections(rule({ startsOn: '2026-11-01' }), context({ billingDate: '2026-10-31' })),
      [DISCOUNT_REJECTIONS.NOT_STARTED],
    );
  });
});

describe('exhausted rules (acceptance test 8)', () => {
  test('a rule at its usage limit is rejected', () => {
    assert.deepEqual(
      discountRejections(rule({ usageLimit: 2, timesUsed: 2 }), context()),
      [DISCOUNT_REJECTIONS.USAGE_LIMIT_REACHED],
    );
  });

  test('a rule one use below its limit still applies', () => {
    assert.deepEqual(discountRejections(rule({ usageLimit: 2, timesUsed: 1 }), context()), []);
  });
});

describe('below-minimum rules (acceptance test 9)', () => {
  test('a 2-seat subscription does not get a 3-seat rule', () => {
    assert.deepEqual(
      discountRejections(rule({ minimumQuantity: 3 }), context({ quantity: 2 })),
      [DISCOUNT_REJECTIONS.BELOW_MINIMUM_QUANTITY],
    );
  });

  test('exactly the minimum quantity qualifies', () => {
    assert.deepEqual(discountRejections(rule({ minimumQuantity: 3 }), context({ quantity: 3 })), []);
  });
});

describe('disabled rules', () => {
  test('a disabled rule never applies, whatever else holds', () => {
    assert.deepEqual(discountRejections(rule({ enabled: false }), context()), [DISCOUNT_REJECTIONS.DISABLED]);
  });
});

describe('several reasons at once are all reported', () => {
  test('expired, exhausted, and below-minimum together', () => {
    const reasons = discountRejections(
      rule({ endsOn: '2026-09-30', usageLimit: 1, timesUsed: 1, minimumQuantity: 5 }),
      context({ quantity: 2 }),
    );
    // Reasons are reported in the order the conditions are checked.
    assert.deepEqual(reasons, [
      DISCOUNT_REJECTIONS.BELOW_MINIMUM_QUANTITY,
      DISCOUNT_REJECTIONS.EXPIRED,
      DISCOUNT_REJECTIONS.USAGE_LIMIT_REACHED,
    ]);
  });
});

describe('selecting one rule per invoice', () => {
  test('returns null when no rule is eligible', () => {
    assert.equal(selectDiscount([rule({ minimumQuantity: 9 })], context()), null);
  });

  test('rules do not stack: the highest percentage wins alone', () => {
    const chosen = selectDiscount(
      [rule({ id: 'ten', percent: '10.00' }), rule({ id: 'fifteen', percent: '15.00' })],
      context(),
    );
    assert.equal(chosen.id, 'fifteen');
  });

  test('an ineligible higher rule is skipped in favour of an eligible lower one', () => {
    const chosen = selectDiscount(
      [rule({ id: 'exhausted-20', percent: '20.00', usageLimit: 1, timesUsed: 1 }), rule({ id: 'ten', percent: '10.00' })],
      context(),
    );
    assert.equal(chosen.id, 'ten');
  });

  test('on a tie, the rule listed first wins', () => {
    const chosen = selectDiscount([rule({ id: 'first' }), rule({ id: 'second' })], context());
    assert.equal(chosen.id, 'first');
  });
});

describe('invoice amounts with a discount (billing-rules.md section 5 worked example)', () => {
  test('3 seats at 100.00, 10% discount, 10% tax: 297.00 total', () => {
    const amounts = invoiceAmounts({ quantity: 3, unitPrice: '100.00', discountPercent: '10.00', taxRatePercent: '10.00' });
    assert.equal(amounts.subtotal, '300.00');
    assert.equal(amounts.discount_percent, '10.00');
    assert.equal(amounts.discount_amount, '30.00');
    assert.equal(amounts.taxable_amount, '270.00');
    assert.equal(amounts.tax_amount, '27.00');
    assert.equal(amounts.total, '297.00');
  });

  test('the discount is rounded half up to the cent', () => {
    // 1 cent at 50% = 0.5 cent, which rounds up to 1 cent
    const amounts = invoiceAmounts({ quantity: 1, unitPrice: '0.01', discountPercent: '50.00' });
    assert.equal(amounts.discount_amount, '0.01');
    assert.equal(amounts.taxable_amount, '0.00');
  });

  test('no discount gives a zero discount amount', () => {
    assert.equal(invoiceAmounts({ quantity: 3, unitPrice: '100.00' }).discount_amount, '0.00');
  });

  test('a discount above 100% is rejected', () => {
    assert.throws(() => invoiceAmounts({ quantity: 1, unitPrice: '1.00', discountPercent: '150.00' }), BillingValidationError);
  });
});
