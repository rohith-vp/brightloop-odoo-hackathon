import { parseMoney, formatMoney, BillingValidationError } from './money.js';
import { calculateTax } from './tax.js';
import { billingPeriod, periodIndexFor, parseIsoDate } from './periods.js';

// Invoice amounts for one subscription and one period, in integer cents.
// Discounts are not applied here; the discount engine will reduce the taxable amount.
// Tax applies to the taxable amount, following docs/billing-rules.md section 5.
export function invoiceAmounts({ quantity, unitPrice, taxRatePercent = '0.00' }) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new BillingValidationError('Quantity must be a positive whole number.', { quantity: 'Must be at least 1.' });
  }

  const unitCents = parseMoney(unitPrice);
  const subtotalCents = unitCents * quantity;
  if (!Number.isSafeInteger(subtotalCents)) {
    throw new BillingValidationError('Invoice amount is too large to calculate safely.');
  }

  const discountCents = 0;
  const taxableCents = subtotalCents - discountCents;
  const taxCents = calculateTax({ taxableCents, ratePercent: taxRatePercent });

  return {
    quantity,
    unit_price: formatMoney(unitCents),
    subtotal: formatMoney(subtotalCents),
    discount_amount: formatMoney(discountCents),
    taxable_amount: formatMoney(taxableCents),
    tax_rate_percent: taxRatePercent,
    tax_amount: formatMoney(taxCents),
    total: formatMoney(taxableCents + taxCents),
  };
}

// Returns every period that should be invoiced now, in order. Each period is
// { index, start, end }, as a half-open interval [start, end).
//
// - Periods start at the subscription's start date (see periods.js).
// - Periods already invoiced (lastBilledPeriodStart and earlier) are skipped.
//   Periods still outstanding are returned, so a missed run catches up, and nothing is skipped.
// - A period that starts on or after expiryDate is not billed.
export function periodsToBill({ startDate, interval, asOf, lastBilledPeriodStart = null, expiryDate = null }) {
  parseIsoDate(startDate);
  parseIsoDate(asOf);

  const lastDueIndex = periodIndexFor(startDate, interval, asOf);
  const firstIndex = lastBilledPeriodStart ? periodIndexFor(startDate, interval, lastBilledPeriodStart) + 1 : 0;

  const periods = [];
  for (let index = firstIndex; index <= lastDueIndex; index += 1) {
    const period = billingPeriod(startDate, interval, index);
    if (expiryDate && period.start >= expiryDate) break;
    periods.push({ index, ...period });
  }
  return periods;
}
