import { parseRatePercent, BillingValidationError } from './money.js';
import { parseIsoDate } from './periods.js';

// Discount rules (docs/billing-rules.md section 6). A rule applies to an invoice only when
// every condition holds: enabled, quantity at or above the minimum, billing date inside the
// window, and usage remaining.
//
// Each rule has: { id, percent, minimumQuantity, startsOn, endsOn, usageLimit, timesUsed, enabled }
//   percent:     a percent string such as "10.00"
//   startsOn:    ISO date, first day the rule can apply (inclusive)
//   endsOn:      ISO date, last day the rule can apply (inclusive), or null for open-ended
//   usageLimit:  maximum number of invoices, or null for unlimited
//   timesUsed:   invoices the rule has already been applied to

export const DISCOUNT_REJECTIONS = Object.freeze({
  DISABLED: 'disabled',
  BELOW_MINIMUM_QUANTITY: 'below_minimum_quantity',
  NOT_STARTED: 'not_started',
  EXPIRED: 'expired',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
});

// Returns why a rule does not apply to this invoice, or an empty array if it applies.
export function discountRejections(rule, { quantity, billingDate }) {
  parseIsoDate(billingDate);
  parseRatePercent(rule.percent);

  const reasons = [];
  if (!rule.enabled) reasons.push(DISCOUNT_REJECTIONS.DISABLED);
  if (quantity < rule.minimumQuantity) reasons.push(DISCOUNT_REJECTIONS.BELOW_MINIMUM_QUANTITY);
  if (billingDate < rule.startsOn) reasons.push(DISCOUNT_REJECTIONS.NOT_STARTED);
  if (rule.endsOn && billingDate > rule.endsOn) reasons.push(DISCOUNT_REJECTIONS.EXPIRED);
  if (rule.usageLimit !== null && rule.usageLimit !== undefined && rule.timesUsed >= rule.usageLimit) {
    reasons.push(DISCOUNT_REJECTIONS.USAGE_LIMIT_REACHED);
  }
  return reasons;
}

// Chooses the one rule to apply to an invoice, or null if none is eligible.
// Rules do not stack. If several are eligible, the highest percentage wins.
// On a tie, the rule that comes first in `rules` wins, so callers should sort by creation order.
export function selectDiscount(rules, context) {
  let best = null;
  for (const rule of rules) {
    if (discountRejections(rule, context).length > 0) continue;
    if (best === null || parseRatePercent(rule.percent) > parseRatePercent(best.percent)) {
      best = rule;
    }
  }
  return best;
}

export function assertDiscountRule(rule) {
  if (!rule.startsOn) throw new BillingValidationError('A discount rule needs a start date.');
  parseIsoDate(rule.startsOn);
  if (rule.endsOn) {
    parseIsoDate(rule.endsOn);
    if (rule.endsOn < rule.startsOn) throw new BillingValidationError('A discount cannot end before it starts.');
  }
  return rule;
}
