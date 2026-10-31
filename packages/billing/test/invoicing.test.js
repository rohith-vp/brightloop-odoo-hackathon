import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { invoiceAmounts, periodsToBill, BillingValidationError } from '../src/index.js';

describe('invoiceAmounts (billing-rules.md section 5 worked examples)', () => {
  test('3 seats at 100.00 with 10% tax gives a 330.00 total', () => {
    const amounts = invoiceAmounts({ quantity: 3, unitPrice: '100.00', taxRatePercent: '10.00' });
    assert.equal(amounts.subtotal, '300.00');
    assert.equal(amounts.discount_amount, '0.00');
    assert.equal(amounts.tax_amount, '30.00');
    assert.equal(amounts.total, '330.00');
  });

  test('no tax configured means tax 0.00', () => {
    const amounts = invoiceAmounts({ quantity: 2, unitPrice: '660.00' });
    assert.equal(amounts.tax_amount, '0.00');
    assert.equal(amounts.total, '1320.00');
  });

  test('tax is rounded half up to the cent', () => {
    // 0.05 at 10% = 0.005, which rounds up to 0.01
    const amounts = invoiceAmounts({ quantity: 1, unitPrice: '0.05', taxRatePercent: '10.00' });
    assert.equal(amounts.tax_amount, '0.01');
    assert.equal(amounts.total, '0.06');
  });

  test('rejects a quantity below 1 or not a whole number', () => {
    assert.throws(() => invoiceAmounts({ quantity: 0, unitPrice: '1.00' }), BillingValidationError);
    assert.throws(() => invoiceAmounts({ quantity: 1.5, unitPrice: '1.00' }), BillingValidationError);
  });
});

describe('periodsToBill (which periods a run should invoice)', () => {
  const monthly = { startDate: '2026-01-31', interval: 'MONTH' };

  test('the first run invoices every period up to the as-of date, starting at the anchor', () => {
    const periods = periodsToBill({ ...monthly, asOf: '2026-03-31' });
    assert.deepEqual(
      periods.map((p) => p.start),
      ['2026-01-31', '2026-02-28', '2026-03-31'],
    );
  });

  test('a period already invoiced is not returned again (idempotency at planning level)', () => {
    const periods = periodsToBill({ ...monthly, asOf: '2026-02-15', lastBilledPeriodStart: '2026-01-31' });
    assert.deepEqual(periods, []);
  });

  test('periods missed while the batch did not run are caught up, not skipped', () => {
    const periods = periodsToBill({ ...monthly, asOf: '2026-04-10', lastBilledPeriodStart: '2026-01-31' });
    assert.deepEqual(
      periods.map((p) => p.start),
      ['2026-02-28', '2026-03-31'],
    );
  });

  test('nothing is billed before the subscription starts', () => {
    assert.deepEqual(periodsToBill({ ...monthly, asOf: '2025-12-31' }), []);
  });

  test('a period that starts on or after the expiry date is not billed', () => {
    const periods = periodsToBill({
      startDate: '2026-10-01',
      interval: 'MONTH',
      asOf: '2026-12-15',
      expiryDate: '2026-11-01',
    });
    assert.deepEqual(
      periods.map((p) => p.start),
      ['2026-10-01'],
    );
  });

  test('a run after the end of an already-billed period bills only the new ones', () => {
    const periods = periodsToBill({
      startDate: '2026-10-01',
      interval: 'MONTH',
      asOf: '2026-11-01',
      lastBilledPeriodStart: '2026-10-01',
    });
    assert.deepEqual(periods.map((p) => p.start), ['2026-11-01']);
  });
});
