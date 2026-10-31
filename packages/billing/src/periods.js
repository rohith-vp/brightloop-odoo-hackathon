import { BillingValidationError } from './money.js';

// Billing period math, per docs/billing-rules.md §4.
//
// Dates are ISO strings ("YYYY-MM-DD") and are handled in UTC, so no
// timezone can shift a date by a day.
//
// Periods use half-open intervals: [start, end). An end date is the start of
// the next period, so a date on a boundary belongs to the newer period.
//
// Every period is computed from the original anchor date, not from the previous
// period. A January 31 anchor therefore goes Jan 31 -> Feb 28 -> Mar 31, and
// does not drift to Feb 28 -> Mar 28.

export const INTERVALS = Object.freeze(['DAY', 'WEEK', 'MONTH', 'YEAR']);

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDate(value) {
  const match = typeof value === 'string' ? ISO_PATTERN.exec(value) : null;
  if (!match) {
    throw new BillingValidationError(`Invalid date (expected YYYY-MM-DD): ${JSON.stringify(value)}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new BillingValidationError(`Not a real calendar date: ${value}`);
  }
  return { year, month, day };
}

export function formatIsoDate({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysInMonth(year, month) {
  // Day 0 of the next month is the last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Adds calendar months and clamps the day to the target month's last day.
// Jan 31 + 1 month -> Feb 28 (Feb 29 in a leap year). Jan 31 + 2 months -> Mar 31.
export function addMonths(isoDate, months) {
  assertInteger(months, 'months');
  const { year, month, day } = parseIsoDate(isoDate);
  const monthIndex = month - 1 + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12 + 1;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return formatIsoDate({ year: targetYear, month: targetMonth, day: targetDay });
}

// Adds whole days, using UTC so there are no DST or timezone shifts.
export function addDays(isoDate, days) {
  assertInteger(days, 'days');
  const { year, month, day } = parseIsoDate(isoDate);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return formatIsoDate({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

// Moves a date forward by `count` intervals, measured from the anchor.
export function addInterval(isoDate, interval, count) {
  switch (interval) {
    case 'DAY':
      return addDays(isoDate, count);
    case 'WEEK':
      return addDays(isoDate, count * 7);
    case 'MONTH':
      return addMonths(isoDate, count);
    case 'YEAR':
      return addMonths(isoDate, count * 12);
    default:
      throw new BillingValidationError(`Unknown billing interval: ${interval}`);
  }
}

// Returns the period at `index` (0 = the period that starts on the anchor).
// Returns { start, end } as half-open dates: [start, end).
export function billingPeriod(anchorDate, interval, index) {
  assertInteger(index, 'index');
  parseIsoDate(anchorDate);
  if (!INTERVALS.includes(interval)) {
    throw new BillingValidationError(`Unknown billing interval: ${interval}`);
  }
  return {
    start: addInterval(anchorDate, interval, index),
    end: addInterval(anchorDate, interval, index + 1),
  };
}

// Finds which period contains `isoDate`. Returns the index, where 0 is the period
// that starts on the anchor. Dates before the anchor return negative indexes.
export function periodIndexFor(anchorDate, interval, isoDate) {
  parseIsoDate(anchorDate);
  parseIsoDate(isoDate);
  if (!INTERVALS.includes(interval)) {
    throw new BillingValidationError(`Unknown billing interval: ${interval}`);
  }

  // Start with an estimate, then correct it by stepping. This keeps the result exact
  // even when clamping makes the estimate slightly off.
  let index = estimateIndex(anchorDate, interval, isoDate);
  while (billingPeriod(anchorDate, interval, index).start > isoDate) index -= 1;
  while (billingPeriod(anchorDate, interval, index).end <= isoDate) index += 1;
  return index;
}

function estimateIndex(anchorDate, interval, isoDate) {
  const a = parseIsoDate(anchorDate);
  const d = parseIsoDate(isoDate);
  if (interval === 'MONTH' || interval === 'YEAR') {
    const months = (d.year - a.year) * 12 + (d.month - a.month);
    return interval === 'YEAR' ? Math.floor(months / 12) : months;
  }
  const dayCount = daysBetween(anchorDate, isoDate);
  return interval === 'WEEK' ? Math.floor(dayCount / 7) : dayCount;
}

function daysBetween(fromIso, toIso) {
  const f = parseIsoDate(fromIso);
  const t = parseIsoDate(toIso);
  const ms = Date.UTC(t.year, t.month - 1, t.day) - Date.UTC(f.year, f.month - 1, f.day);
  return Math.round(ms / 86_400_000);
}

function assertInteger(value, name) {
  if (!Number.isSafeInteger(value)) {
    throw new BillingValidationError(`${name} must be a whole number`);
  }
}
