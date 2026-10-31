import { parseRatePercent, percentOfCents, BillingValidationError } from './money.js';

// Tax is charged on the taxable amount (after any discount), per billing-rules.md §5.
// Returns the tax in cents for one tax rate.
export function calculateTax({ taxableCents, ratePercent }) {
  const rateHundredths = parseRatePercent(ratePercent);
  return percentOfCents(taxableCents, rateHundredths);
}

// Validates a tax configuration as admin-set rules are saved.
export function validateTaxRule({ name, ratePercent }) {
  const errors = {};
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Name is required.';
  }
  try {
    parseRatePercent(ratePercent);
  } catch (err) {
    errors.rate_percent = 'Rate must be between 0.00 and 100.00 with at most two decimals.';
  }
  if (Object.keys(errors).length > 0) {
    throw new BillingValidationError('Invalid tax rule', errors);
  }
  return { name: name.trim(), ratePercent };
}
