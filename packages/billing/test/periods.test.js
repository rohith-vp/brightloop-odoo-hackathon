import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  addMonths,
  addDays,
  addInterval,
  billingPeriod,
  periodIndexFor,
  daysInMonth,
  parseIsoDate,
  BillingValidationError,
} from '../src/index.js';

describe('addMonths (calendar months with end-of-month clamping)', () => {
  test('Jan 31 + 1 month is Feb 28 in a non-leap year', () => {
    assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  });

  test('Jan 31 + 1 month is Feb 29 in a leap year', () => {
    assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  });

  test('Jan 31 + 2 months is Mar 31, not Mar 3 (no overflow)', () => {
    assert.equal(addMonths('2026-01-31', 2), '2026-03-31');
  });

  test('Mar 31 + 1 month is Apr 30', () => {
    assert.equal(addMonths('2026-03-31', 1), '2026-04-30');
  });

  test('crosses a year boundary', () => {
    assert.equal(addMonths('2026-11-15', 3), '2027-02-15');
    assert.equal(addMonths('2026-12-31', 1), '2027-01-31');
  });

  test('negative months go backwards and clamp', () => {
    assert.equal(addMonths('2026-03-31', -1), '2026-02-28');
    assert.equal(addMonths('2026-01-15', -1), '2025-12-15');
  });

  test('zero months returns the same date', () => {
    assert.equal(addMonths('2026-02-28', 0), '2026-02-28');
  });
});

describe('billingPeriod (anchored, half-open [start, end))', () => {
  test('Jan 31 anchor: Jan 31 -> Feb 28 -> Mar 31, anchored not drifting', () => {
    assert.deepEqual(billingPeriod('2026-01-31', 'MONTH', 0), { start: '2026-01-31', end: '2026-02-28' });
    assert.deepEqual(billingPeriod('2026-01-31', 'MONTH', 1), { start: '2026-02-28', end: '2026-03-31' });
    assert.deepEqual(billingPeriod('2026-01-31', 'MONTH', 2), { start: '2026-03-31', end: '2026-04-30' });
  });

  test('periods are contiguous: each end is the next start', () => {
    for (let i = 0; i < 24; i += 1) {
      const current = billingPeriod('2026-01-31', 'MONTH', i);
      const next = billingPeriod('2026-01-31', 'MONTH', i + 1);
      assert.equal(current.end, next.start, `period ${i}`);
    }
  });

  test('a Feb 29 anchor in a leap year stays on Feb 28 next year, then returns to Feb 29', () => {
    assert.equal(addInterval('2028-02-29', 'YEAR', 1), '2029-02-28');
    assert.equal(addInterval('2028-02-29', 'YEAR', 4), '2032-02-29');
  });

  test('yearly period from a leap day does not drift', () => {
    assert.equal(billingPeriod('2028-02-29', 'YEAR', 4).start, '2032-02-29');
  });

  test('weekly periods are 7 days', () => {
    assert.deepEqual(billingPeriod('2026-10-01', 'WEEK', 0), { start: '2026-10-01', end: '2026-10-08' });
  });

  test('daily periods are 1 day, including across a month end', () => {
    assert.deepEqual(billingPeriod('2026-02-28', 'DAY', 1), { start: '2026-03-01', end: '2026-03-02' });
  });

  test('rejects an unknown interval', () => {
    assert.throws(() => billingPeriod('2026-01-01', 'QUARTER', 0), BillingValidationError);
  });
});

describe('addDays', () => {
  test('crosses month and year boundaries', () => {
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  });
});

describe('periodIndexFor (which period contains a date)', () => {
  test('a boundary date belongs to the newer period', () => {
    assert.equal(periodIndexFor('2026-01-31', 'MONTH', '2026-02-27'), 0);
    assert.equal(periodIndexFor('2026-01-31', 'MONTH', '2026-02-28'), 1);
    assert.equal(periodIndexFor('2026-01-31', 'MONTH', '2026-03-31'), 2);
  });

  test('the anchor date itself is index 0', () => {
    assert.equal(periodIndexFor('2026-01-31', 'MONTH', '2026-01-31'), 0);
  });

  test('dates before the anchor give negative indexes', () => {
    assert.equal(periodIndexFor('2026-01-31', 'MONTH', '2025-12-31'), -1);
  });

  test('index agrees with billingPeriod for many dates across two years', () => {
    const anchor = '2026-01-31';
    let date = '2026-01-01';
    for (let i = 0; i < 800; i += 1) {
      const index = periodIndexFor(anchor, 'MONTH', date);
      const { start, end } = billingPeriod(anchor, 'MONTH', index);
      assert.ok(start <= date && date < end, `${date} not in period ${index}: ${start}..${end}`);
      date = addDays(date, 1);
    }
  });

  test('works for weekly and yearly intervals', () => {
    assert.equal(periodIndexFor('2026-10-01', 'WEEK', '2026-10-08'), 1);
    assert.equal(periodIndexFor('2028-02-29', 'YEAR', '2029-02-27'), 0);
    assert.equal(periodIndexFor('2028-02-29', 'YEAR', '2029-02-28'), 1);
    assert.equal(periodIndexFor('2028-02-29', 'YEAR', '2029-03-01'), 1);
  });
});

describe('date validation', () => {
  test('daysInMonth handles leap years', () => {
    assert.equal(daysInMonth(2028, 2), 29);
    assert.equal(daysInMonth(2026, 2), 28);
    assert.equal(daysInMonth(2100, 2), 28);
    assert.equal(daysInMonth(2000, 2), 29);
  });

  test('rejects impossible dates', () => {
    assert.throws(() => parseIsoDate('2026-02-30'), BillingValidationError);
    assert.throws(() => parseIsoDate('2026-13-01'), BillingValidationError);
    assert.throws(() => parseIsoDate('2026-02-29'), BillingValidationError);
  });

  test('rejects malformed input', () => {
    assert.throws(() => parseIsoDate('2026/01/31'), BillingValidationError);
    assert.throws(() => parseIsoDate('31-01-2026'), BillingValidationError);
    assert.throws(() => parseIsoDate(null), BillingValidationError);
    assert.throws(() => addMonths('2026-01-31', 1.5), BillingValidationError);
  });
});
