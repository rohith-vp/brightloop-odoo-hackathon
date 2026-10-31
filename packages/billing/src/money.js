// Money is handled as integer minor units (cents), never as binary floats.
// API payloads use decimal strings such as "300.00"; they are converted here.

export class BillingValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'BillingValidationError';
    this.details = details;
  }
}

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const RATE_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

// "300.00" -> 30000. "300" and "300.5" are accepted; "-1" and "1.234" are not.
export function parseMoney(value) {
  if (typeof value !== 'string' || !MONEY_PATTERN.test(value)) {
    throw new BillingValidationError(`Invalid money amount: ${JSON.stringify(value)}`);
  }
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

// 30000 -> "300.00"
export function formatMoney(cents) {
  assertCents(cents);
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return `${whole}.${fraction}`;
}

// Percent strings to hundredths of a percent: "10.00" -> 1000 (meaning 10.00%).
// Keeping this integer lets tax math stay exact.
export function parseRatePercent(value) {
  if (typeof value !== 'string' || !RATE_PATTERN.test(value)) {
    throw new BillingValidationError(`Invalid rate percent: ${JSON.stringify(value)}`);
  }
  const [whole, fraction = ''] = value.split('.');
  const hundredths = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (hundredths > 10000) {
    throw new BillingValidationError('Rate percent cannot exceed 100.00');
  }
  return hundredths;
}

// Multiplies cents by a hundredths-of-percent rate and divides by 10,000,
// rounding half up (ties go away from zero; all inputs here are non-negative).
// Example: 30000 cents at 1000 (10.00%) -> 3000 cents.
export function percentOfCents(cents, rateHundredths) {
  assertCents(cents);
  if (!Number.isInteger(rateHundredths) || rateHundredths < 0 || rateHundredths > 10000) {
    throw new BillingValidationError(`Invalid rate: ${rateHundredths}`);
  }
  const product = cents * rateHundredths;
  if (!Number.isSafeInteger(product)) {
    throw new BillingValidationError('Amount too large to calculate safely');
  }
  // floor((2N + D) / 2D) is round-half-up for integers, with D = 10000.
  return Math.floor((2 * product + 10000) / 20000);
}

function assertCents(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new BillingValidationError(`Amount must be a non-negative whole number of cents: ${cents}`);
  }
}
