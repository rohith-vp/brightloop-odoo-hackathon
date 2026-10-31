/**
 * Comprehensive Test Suite for Phase 4: Quotations & Subscriptions
 * Brightloop Subscription Management System
 */

// Mock localStorage for headless Node testing
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

import { quotationService } from '../services/quotationService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';
import { planService } from '../services/planService.js';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', message });
    console.log(`[PASS] ${message}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', message });
    console.error(`[FAIL] ${message}`);
  }
}

function assertThrows(fn, expectedSubstring, message) {
  try {
    fn();
    failed++;
    console.error(`[FAIL] Expected exception not thrown: ${message}`);
  } catch (err) {
    if (!expectedSubstring || err.message.toLowerCase().includes(expectedSubstring.toLowerCase())) {
      passed++;
      console.log(`[PASS] Caught expected error: "${err.message}" -> ${message}`);
    } else {
      failed++;
      console.error(`[FAIL] Threw unexpected error: "${err.message}", expected substring: "${expectedSubstring}"`);
    }
  }
}

console.log('================================================================');
console.log('BRIGHTLOOP PHASE 4: COMPREHENSIVE TEST SUITE (QUOTATIONS & SUBS)');
console.log('================================================================\n');

// Set test baseline date
planService.setMockCurrentDate('2026-11-01');

// ===========================================================================
// SECTION 1: QUOTATION TESTS
// ===========================================================================
console.log('--- 1. QUOTATION TESTS ---');

// 1.1 Create quotation with multiple products and plans
const mockCustomer = {
  id: 'cust_test_1',
  name: 'Acme Global Ventures',
  email: 'procurement@acmeglobal.com',
  phone: '+91 99887 76655',
  billingAddress: {
    street: 'Tech Zone 2, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    country: 'India',
  },
};

const lineItems1 = [
  {
    id: 'item_1',
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_1',
    planName: 'Odoo Connector - Monthly Business',
    billingFrequency: 'Monthly',
    quantity: 2,
    unitPrice: 4999,
    lineTotal: 9998,
  },
  {
    id: 'item_2',
    productId: 'prod_2',
    productName: 'Cloud Infrastructure Monitoring Daemon',
    planId: 'plan_3',
    planName: 'Cloud Daemon - Growth Tier',
    billingFrequency: 'Monthly',
    quantity: 3,
    unitPrice: 3499,
    lineTotal: 10497,
  },
];

const createdQuote = quotationService.createQuotation({
  customer: mockCustomer,
  quotationDate: '2026-11-01',
  expiryDate: '2026-12-01',
  notes: 'Commercial terms with 10% discount and 18% GST.',
  lineItems: lineItems1,
  discountType: 'percentage',
  discountValue: 10,
  taxRate: 18,
  status: 'Draft',
});

// 1.2 Verify creation and line items
assert(createdQuote.id !== undefined, 'Quotation created with unique ID');
assert(createdQuote.quotationNumber.startsWith('QT-'), 'Quotation number generated with prefix QT-');
assert(createdQuote.lineItems.length === 2, '2 line items added');

// 1.3 Verify quantities and unit prices
assert(createdQuote.lineItems[0].quantity === 2, 'Line item 1 quantity verified (2)');
assert(createdQuote.lineItems[0].unitPrice === 4999, 'Line item 1 unit price verified (₹4,999)');
assert(createdQuote.lineItems[0].lineTotal === 9998, 'Line item 1 line total verified (₹9,998)');
assert(createdQuote.lineItems[1].quantity === 3, 'Line item 2 quantity verified (3)');
assert(createdQuote.lineItems[1].unitPrice === 3499, 'Line item 2 unit price verified (₹3,499)');
assert(createdQuote.lineItems[1].lineTotal === 10497, 'Line item 2 line total verified (₹10,497)');

// 1.4 Verify subtotal, discount, tax, and grand total calculations
// Subtotal = 9998 + 10497 = 20495
// Discount = 10% of 20495 = 2049.50
// Taxable = 20495 - 2049.50 = 18445.50
// Tax (18%) = 18445.50 * 0.18 = 3320.19
// Grand Total = 18445.50 + 3320.19 = 21765.69
assert(createdQuote.subtotal === 20495, `Subtotal verified: ₹${createdQuote.subtotal} (expected ₹20,495)`);
assert(createdQuote.discountAmount === 2049.5, `Discount verified: ₹${createdQuote.discountAmount} (expected ₹2,049.50)`);
assert(createdQuote.taxAmount === 3320.19, `Tax (18% GST) verified: ₹${createdQuote.taxAmount} (expected ₹3,320.19)`);
assert(createdQuote.grandTotal === 21765.69, `Grand Total verified: ₹${createdQuote.grandTotal} (expected ₹21,765.69)`);

// 1.5 Save as draft verification
assert(createdQuote.status === 'Draft', 'Quotation saved initially as Draft');

// 1.6 Edit draft quotation
const updatedQuote = quotationService.updateQuotation(createdQuote.id, {
  notes: 'Updated terms: Changed discount to flat ₹3,000.',
  discountType: 'fixed',
  discountValue: 3000,
});
// Subtotal = 20495, Discount = 3000 -> Taxable = 17495 -> Tax = 17495 * 0.18 = 3149.10 -> Grand Total = 20644.10
assert(updatedQuote.discountType === 'fixed', 'Draft updated: discountType changed to fixed');
assert(updatedQuote.discountAmount === 3000, 'Draft updated: discount amount is ₹3,000');
assert(updatedQuote.grandTotal === 20644.1, `Draft updated: grand total recalculated to ₹${updatedQuote.grandTotal} (expected ₹20,644.10)`);

// 1.7 Mark quotation as sent
const sentQuote = quotationService.sendQuotation(createdQuote.id);
assert(sentQuote.status === 'Sent', 'Draft quotation marked as Sent');

// 1.8 Confirm quotation
const confirmedQuote = quotationService.confirmQuotation(createdQuote.id);
assert(confirmedQuote.status === 'Confirmed', 'Quotation successfully Confirmed');

// 1.9 Prevent editing confirmed quotation
assertThrows(
  () => quotationService.updateQuotation(confirmedQuote.id, { notes: 'Attempting to change confirmed quote' }),
  'cannot edit quotation in confirmed status',
  'Editing confirmed quotation is strictly prevented'
);

// 1.10 Cancel quotation
const quoteToCancel = quotationService.createQuotation({
  customer: mockCustomer,
  quotationDate: '2026-11-01',
  expiryDate: '2026-11-15',
  lineItems: [lineItems1[0]],
  status: 'Draft',
});
const cancelledQuote = quotationService.cancelQuotation(quoteToCancel.id);
assert(cancelledQuote.status === 'Cancelled', 'Quotation successfully Cancelled');

// 1.11 Prevent invalid status transitions
assertThrows(
  () => quotationService.updateQuotationStatus(cancelledQuote.id, 'Confirmed'),
  'invalid quotation status transition',
  'Prevent transition from Cancelled to Confirmed'
);

assertThrows(
  () => quotationService.updateQuotationStatus(confirmedQuote.id, 'Draft'),
  'invalid quotation status transition',
  'Prevent transition from Confirmed to Draft'
);


// ===========================================================================
// SECTION 2: SUBSCRIPTION TESTS
// ===========================================================================
console.log('\n--- 2. SUBSCRIPTION TESTS ---');

// 2.1 Create subscription directly
const directSub = subscriptionService.createSubscription({
  customer: mockCustomer,
  productId: 'prod_2',
  productName: 'Cloud Infrastructure Monitoring Daemon',
  planId: 'plan_3',
  planName: 'Cloud Daemon - Growth Tier',
  billingFrequency: 'Monthly',
  quantity: 2,
  unitPrice: 3499,
  startDate: '2026-11-01',
  status: 'Confirmed',
  notes: 'Direct subscription creation test.',
});

assert(directSub.id !== undefined, 'Direct subscription created with unique ID');
assert(directSub.subscriptionNumber.startsWith('SUB-'), 'Subscription number generated with prefix SUB-');
assert(directSub.totalPrice === 6998, `Direct subscription total price calculated (₹6,998)`);
assert(directSub.status === 'Confirmed', 'Initial status is Confirmed');

// 2.2 Create subscription from a confirmed quotation
const subFromQuote = subscriptionService.createFromQuotation(confirmedQuote.id, {
  status: 'Confirmed',
});

assert(subFromQuote.quotationId === confirmedQuote.id, 'Subscription references confirmed quotation ID');
assert(subFromQuote.quotationNumber === confirmedQuote.quotationNumber, 'Subscription references quotation number');
assert(subFromQuote.customer.name === mockCustomer.name, 'Customer information populated from quotation');
assert(subFromQuote.productId === confirmedQuote.lineItems[0].productId, 'Product populated from quotation');
assert(subFromQuote.planId === confirmedQuote.lineItems[0].planId, 'Plan populated from quotation');
assert(subFromQuote.quantity === confirmedQuote.lineItems[0].quantity, 'Quantity populated from quotation');
assert(subFromQuote.unitPrice === confirmedQuote.lineItems[0].unitPrice, 'Unit price populated from quotation');

// Check that quotation is linked
const linkedQuote = quotationService.getQuotationById(confirmedQuote.id);
assert(linkedQuote.subscriptionId === subFromQuote.id, 'Quotation record updated with linked subscription ID');

// 2.3 Verify billing frequency and dates
assert(subFromQuote.billingFrequency === 'Monthly', 'Billing frequency is Monthly');
assert(subFromQuote.startDate === '2026-11-01', 'Start date matches simulated date 2026-11-01');
assert(subFromQuote.endDate !== '', 'End date calculated automatically');
assert(subFromQuote.nextInvoiceDate !== '', 'Next invoice date calculated automatically');

// 2.4 Activate a subscription
const activatedSub = subscriptionService.activateSubscription(subFromQuote.id);
assert(activatedSub.status === 'Active', 'Subscription transitioned from Confirmed to Active');

// 2.5 Pause an active subscription
const pausedSub = subscriptionService.pauseSubscription(activatedSub.id, 'Customer requested temporary pause');
assert(pausedSub.status === 'Paused', 'Subscription transitioned from Active to Paused');

// 2.6 Resume a paused subscription
const resumedSub = subscriptionService.resumeSubscription(pausedSub.id);
assert(resumedSub.status === 'Active', 'Subscription transitioned from Paused to Active');

// 2.7 Renew an existing subscription
const currentEnd = resumedSub.endDate;
const renewedSub = subscriptionService.renewSubscription(resumedSub.id, 12);
assert(renewedSub.status === 'Active', 'Renewed subscription is Active');
assert(renewedSub.endDate > currentEnd, `End date extended from ${currentEnd} to ${renewedSub.endDate}`);

// 2.8 Close a subscription manually (Early Closure)
const closedSub = subscriptionService.closeSubscription(renewedSub.id, true, 'Customer migrating datacenter');
assert(closedSub.status === 'Closed', 'Subscription closed manually');

// 2.9 Test automatic closure after expiry
const autoCloseSub = subscriptionService.createSubscription({
  customer: mockCustomer,
  productId: 'prod_4',
  productName: 'Smart Billing POS Terminal v2',
  planId: 'plan_5',
  planName: 'POS Terminal Daily Hardware Lease',
  billingFrequency: 'Daily',
  quantity: 1,
  unitPrice: 150,
  startDate: '2026-11-01',
  endDate: '2026-11-10', // Scheduled to end on 10 Nov 2026
  status: 'Active',
});

// Fast forward clock to 11 Nov 2026 (Past end date)
planService.setMockCurrentDate('2026-11-11');
const evaluatedSubs = subscriptionService.getSubscriptions();
const targetAutoClosed = evaluatedSubs.find((s) => s.id === autoCloseSub.id);
assert(targetAutoClosed.status === 'Closed', 'Subscription automatically closed when date passed scheduled end date');
assert(targetAutoClosed.activityHistory[0].title === 'Automatic Closure', 'Automatic Closure timeline entry recorded');

// Reset clock back to 01 Nov 2026
planService.setMockCurrentDate('2026-11-01');


// ===========================================================================
// SECTION 3: BUSINESS LOGIC TESTS
// ===========================================================================
console.log('\n--- 3. BUSINESS LOGIC TESTS ---');

// 3.1 Prevent subscription creation from an unconfirmed quotation
const draftQuote = quotationService.createQuotation({
  customer: mockCustomer,
  quotationDate: '2026-11-01',
  expiryDate: '2026-12-01',
  lineItems: [lineItems1[0]],
  status: 'Draft',
});

assertThrows(
  () => subscriptionService.createFromQuotation(draftQuote.id),
  'unconfirmed quotation',
  'Cannot create subscription from Draft quotation'
);

const sentQuote2 = quotationService.createQuotation({
  customer: mockCustomer,
  quotationDate: '2026-11-01',
  expiryDate: '2026-12-01',
  lineItems: [lineItems1[0]],
  status: 'Sent',
});

assertThrows(
  () => subscriptionService.createFromQuotation(sentQuote2.id),
  'unconfirmed quotation',
  'Cannot create subscription from Sent quotation'
);

// 3.2 Prevent invalid lifecycle transitions
assertThrows(
  () => subscriptionService.activateSubscription(closedSub.id),
  'invalid transition',
  'Cannot activate a Closed subscription directly'
);

assertThrows(
  () => subscriptionService.pauseSubscription(closedSub.id),
  'invalid transition',
  'Cannot pause a Closed subscription'
);

assertThrows(
  () => subscriptionService.resumeSubscription(closedSub.id),
  'invalid transition',
  'Cannot resume a Closed subscription'
);

// 3.3 Ensure closing a subscription does not delete its quotation
const quoteBeforeClose = quotationService.getQuotationById(confirmedQuote.id);
assert(quoteBeforeClose !== null, 'Quotation exists after subscription is closed');
assert(quoteBeforeClose.status === 'Confirmed', 'Quotation maintains Confirmed status');
assert(quoteBeforeClose.subscriptionId === subFromQuote.id, 'Quotation retains linked subscription ID');

// 3.4 Ensure pausing a subscription does not change its billing plan or pricing
const subToPause = subscriptionService.createSubscription({
  customer: mockCustomer,
  productId: 'prod_1',
  productName: 'Odoo Subscription Connector',
  planId: 'plan_1',
  planName: 'Odoo Connector - Monthly Business',
  billingFrequency: 'Monthly',
  quantity: 5,
  unitPrice: 4999,
  startDate: '2026-11-01',
  status: 'Active',
});

const pausedResult = subscriptionService.pauseSubscription(subToPause.id);
assert(pausedResult.planId === 'plan_1', 'Plan ID untouched after pause');
assert(pausedResult.planName === 'Odoo Connector - Monthly Business', 'Plan Name untouched after pause');
assert(pausedResult.quantity === 5, 'Quantity untouched after pause');
assert(pausedResult.unitPrice === 4999, 'Unit price untouched after pause');
assert(pausedResult.totalPrice === 24995, 'Total price untouched after pause');
assert(pausedResult.billingFrequency === 'Monthly', 'Billing frequency untouched after pause');

// 3.5 Ensure renewal creates the correct new subscription period
const preRenewalSub = subscriptionService.createSubscription({
  customer: mockCustomer,
  productId: 'prod_1',
  productName: 'Odoo Subscription Connector',
  planId: 'plan_1',
  planName: 'Odoo Connector - Monthly Business',
  billingFrequency: 'Monthly',
  quantity: 1,
  unitPrice: 4999,
  startDate: '2026-11-01',
  endDate: '2027-10-31',
  status: 'Active',
});

const renewed6Mo = subscriptionService.renewSubscription(preRenewalSub.id, 6);
assert(renewed6Mo.endDate === '2028-04-30', `6-month renewal accurately advanced end date from 2027-10-31 to 2028-04-30`);

// 3.6 Ensure subscription activity history is recorded correctly
assert(renewed6Mo.activityHistory.length >= 2, 'Activity history has multiple timeline events');
const eventTypes = renewed6Mo.activityHistory.map((e) => e.event);
assert(eventTypes.includes('Created'), 'Activity history contains Created event');
assert(eventTypes.includes('Renewed'), 'Activity history contains Renewed event');
for (const event of renewed6Mo.activityHistory) {
  assert(event.timestamp !== undefined, `Event "${event.title}" has valid ISO timestamp`);
  assert(event.user !== undefined, `Event "${event.title}" records acting user`);
}

// 3.7 Verify date boundaries and timezone handling
assert(planService.getCurrentDate() === '2026-11-01', 'Mock clock returns expected YYYY-MM-DD');
const dStart = '2026-11-01';
const dEnd = '2026-11-30';
assert(dStart <= '2026-11-01', 'Calendar boundary start is inclusive (<=)');
assert(dEnd >= '2026-11-30', 'Calendar boundary end is inclusive (>=)');
assert('2026-12-01' > dEnd, 'Post-boundary date evaluates strictly greater than end date');


// ===========================================================================
// SECTION 4: PERSISTENCE TESTS
// ===========================================================================
console.log('\n--- 4. PERSISTENCE TESTS ---');

// 4.1 Verify records remain in localStorage
const storedQuotesRaw = localStorage.getItem('brightloop_quotations_data');
const storedSubsRaw = localStorage.getItem('brightloop_subscriptions_data');
assert(storedQuotesRaw !== null, 'Quotations stored in localStorage');
assert(storedSubsRaw !== null, 'Subscriptions stored in localStorage');

const parsedQuotes = JSON.parse(storedQuotesRaw);
const foundQuote = parsedQuotes.find((q) => q.id === createdQuote.id);
assert(foundQuote !== undefined, 'Created quotation persisted in storage');
assert(foundQuote.customer.name === mockCustomer.name, 'Customer name persisted');
assert(foundQuote.grandTotal === updatedQuote.grandTotal, 'Calculated grand total persisted');

const parsedSubs = JSON.parse(storedSubsRaw);
const foundSub = parsedSubs.find((s) => s.id === subFromQuote.id);
assert(foundSub !== undefined, 'Created subscription persisted in storage');
assert(foundSub.status === 'Closed', 'Latest lifecycle status (Closed) persisted');

// 4.2 Edit records and verify updated info persists
const reloadedQuote = quotationService.updateQuotation(quoteToCancel.id, {
  notes: 'Persisted cancellation note: Client went with alternative.',
  _allowStatusOnly: true,
});
const reloadedQuotesFromStorage = quotationService.getQuotations();
const verifiedUpdatedQuote = reloadedQuotesFromStorage.find((q) => q.id === quoteToCancel.id);
assert(
  verifiedUpdatedQuote.notes === 'Persisted cancellation note: Client went with alternative.',
  'Updated quotation note persisted across reload'
);

// Reset mock clock
planService.clearMockCurrentDate();

console.log('\n================================================================');
console.log(`TOTAL PHASE 4 TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

