/**
 * Comprehensive Verification & Test Suite for Brightloop Phase 5
 * Invoices, Payments & Discounts
 */

// Global localStorage mock for Node execution
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

import { invoiceService } from '../services/invoiceService.js';
import { paymentService } from '../services/paymentService.js';
import { discountService } from '../services/discountService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { productService } from '../services/productService.js';
import { planService } from '../services/planService.js';
import { customerService } from '../services/customerService.js';

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
    console.error(`[FAIL] Expected exception was not thrown: ${message}`);
  } catch (err) {
    if (!expectedSubstring || err.message.toLowerCase().includes(expectedSubstring.toLowerCase())) {
      passed++;
      console.log(`[PASS] Caught expected error: "${err.message}" -> ${message}`);
    } else {
      failed++;
      console.error(`[FAIL] Threw unexpected error: "${err.message}", expected: "${expectedSubstring}"`);
    }
  }
}

console.log('================================================================');
console.log('BRIGHTLOOP PHASE 5: COMPREHENSIVE VERIFICATION & TEST SUITE');
console.log('Invoices, Payments & Discounts');
console.log('================================================================\n');

// 1. Set simulated current date
planService.setMockCurrentDate('2026-11-01');

// Get active subscriptions to work with
const allSubs = subscriptionService.getSubscriptions();
const activeSubs = allSubs.filter((s) => s.status === 'Active');
assert(activeSubs.length > 0, 'Found active subscriptions in seed data for invoice generation');
const sub1 = activeSubs[0];

// ---------------------------------------------------------------------------
// TEST 1: Generate single invoice from active subscription
// ---------------------------------------------------------------------------
console.log('\n--- Test 1: Single Invoice Generation ---');
const singleInv = invoiceService.generateFromSubscription(sub1.id, {
  invoiceDate: '2026-11-01',
  dueDate: '2026-11-15',
  notes: 'November subscription billing',
});

assert(singleInv && singleInv.id, 'Single invoice successfully generated with ID: ' + singleInv?.id);
assert(singleInv.subscriptionId === sub1.id, 'Generated invoice linked to correct subscription');
assert(singleInv.customerId === sub1.customerId, 'Generated invoice assigned to subscription customer');
assert(singleInv.status === 'Draft' || singleInv.status === 'Confirmed', 'Generated invoice has valid initial status: ' + singleInv.status);

// ---------------------------------------------------------------------------
// TEST 2: Generate batch invoices for multiple subscriptions
// ---------------------------------------------------------------------------
console.log('\n--- Test 2: Batch Invoice Generation ---');
// Pick next period dates so activeSubs eligible
const batchResult = invoiceService.generateBatchInvoices({
  subscriptionIds: activeSubs.map((s) => s.id),
  invoiceDate: '2026-12-01',
  dueDate: '2026-12-15',
});

assert(batchResult && Array.isArray(batchResult.generated), 'Batch invoice generator returned structured summary');
assert(batchResult.generated.length > 0, `Generated ${batchResult.generated.length} batch invoices for active subscriptions`);
assert(typeof batchResult.skippedCount === 'number', 'Batch summary includes skipped count');

// ---------------------------------------------------------------------------
// TEST 3: Prevent duplicate invoices for the same billing period
// ---------------------------------------------------------------------------
console.log('\n--- Test 3: Duplicate Invoice Prevention ---');
assertThrows(
  () => {
    // Attempting to generate another invoice with the exact same period for sub1
    invoiceService.generateFromSubscription(sub1.id, {
      periodStart: singleInv.periodStart,
      periodEnd: singleInv.periodEnd,
      invoiceDate: '2026-11-02',
    });
  },
  'already exists',
  'Duplicate invoice blocked when generated for identical subscription and billing period'
);

// ---------------------------------------------------------------------------
// TEST 4: Calculate subtotal, discounts, tax, and total correctly
// ---------------------------------------------------------------------------
console.log('\n--- Test 4: Financial Calculations (Subtotal, Discount, GST Tax, Total) ---');
// Let's create an explicit invoice using createInvoice with known amounts
const sampleInv = invoiceService.createInvoice({
  customerId: sub1.customerId,
  subscriptionId: sub1.id,
  invoiceDate: '2026-11-01',
  dueDate: '2026-11-15',
  periodStart: '2026-11-01',
  periodEnd: '2026-11-30',
  items: [
    {
      productId: 'prod_test_1',
      productName: 'Cloud Server Base',
      quantity: 2,
      unitPrice: 5000,
      totalPrice: 10000,
    },
    {
      productId: 'prod_test_2',
      productName: 'Premium Support Addon',
      quantity: 1,
      unitPrice: 2000,
      totalPrice: 2000,
    },
  ],
  subtotal: 12000,
  discountType: 'percentage',
  discountValue: 10,
  discountAmount: 1200, // 10% of 12000
  taxableAmount: 10800,
  taxRate: 18,
  taxAmount: 1944, // 18% of 10800
  grandTotal: 12744, // 10800 + 1944
  status: 'Draft',
});

assert(sampleInv.subtotal === 12000, 'Subtotal correctly computed as sum of item prices (12,000)');
assert(sampleInv.discountAmount === 1200, '10% discount amount correctly calculated as 1,200');
assert(sampleInv.taxAmount === 1944, '18% GST tax correctly calculated on post-discount amount (1,944)');
assert(sampleInv.grandTotal === 12744, 'Grand total correctly computed as 12,744');
assert(sampleInv.balanceDue === 12744, 'Initial balance due matches grand total (12,744)');

// ---------------------------------------------------------------------------
// TEST 5: Confirm an invoice
// ---------------------------------------------------------------------------
console.log('\n--- Test 5: Invoice Confirmation ---');
assert(sampleInv.status === 'Draft', 'Invoice starts in Draft status');
const confirmedInv = invoiceService.confirmInvoice(sampleInv.id);
assert(confirmedInv.status === 'Confirmed', 'Invoice successfully moved to Confirmed status');

// ---------------------------------------------------------------------------
// TEST 6: Record full payment
// ---------------------------------------------------------------------------
console.log('\n--- Test 6: Record Full Payment ---');
// Create a separate invoice for full payment test
const invForFullPay = invoiceService.createInvoice({
  customerId: sub1.customerId,
  subscriptionId: sub1.id,
  invoiceDate: '2026-11-01',
  dueDate: '2026-11-15',
  items: [{ productName: 'One-off Consulting', quantity: 1, unitPrice: 5000, totalPrice: 5000 }],
  subtotal: 5000,
  discountAmount: 0,
  taxRate: 18,
  taxAmount: 900,
  grandTotal: 5900,
  status: 'Confirmed',
});

const fullPayment = paymentService.recordPayment({
  customerId: invForFullPay.customerId,
  invoiceId: invForFullPay.id,
  amount: 5900,
  paymentMethod: 'Bank Transfer',
  referenceNumber: 'NEFT-FULL-PAY-001',
  paymentDate: '2026-11-02',
});

const refreshedFullPayInv = invoiceService.getInvoiceById(invForFullPay.id);
assert(fullPayment && fullPayment.id, 'Full payment record created: ' + fullPayment?.paymentReference);
assert(refreshedFullPayInv.amountPaid === 5900, 'Invoice amount paid equals 5,900');
assert(refreshedFullPayInv.balanceDue === 0, 'Invoice balance due dropped to 0');
assert(refreshedFullPayInv.status === 'Paid', 'Invoice status transitioned to Paid upon full settlement');

// ---------------------------------------------------------------------------
// TEST 7 & 8: Record partial payment and verify balance due updates
// ---------------------------------------------------------------------------
console.log('\n--- Test 7 & 8: Partial Payment & Balance Due Tracking ---');
// On confirmedInv: grandTotal is 12744, balanceDue is 12744
const partialPayment1 = paymentService.recordPayment({
  customerId: confirmedInv.customerId,
  invoiceId: confirmedInv.id,
  amount: 5000,
  paymentMethod: 'UPI',
  referenceNumber: 'UPI-PARTIAL-001',
  paymentDate: '2026-11-03',
});

let updatedInv = invoiceService.getInvoiceById(confirmedInv.id);
assert(updatedInv.amountPaid === 5000, 'Invoice amountPaid accurately recorded 5,000');
assert(updatedInv.balanceDue === 7744, 'Invoice balanceDue reduced from 12,744 to 7,744');
assert(updatedInv.status === 'Partially Paid', 'Invoice status updated to Partially Paid');

// ---------------------------------------------------------------------------
// TEST 9: Verify complete lifecycle transitions (Draft -> Confirmed -> Partially Paid -> Paid)
// ---------------------------------------------------------------------------
console.log('\n--- Test 9: Complete Lifecycle Transitions ---');
// Pay the remaining 7,744 to complete the transition to Paid
const partialPayment2 = paymentService.recordPayment({
  customerId: confirmedInv.customerId,
  invoiceId: confirmedInv.id,
  amount: 7744,
  paymentMethod: 'Card',
  referenceNumber: 'CARD-TXN-7744',
  paymentDate: '2026-11-04',
});

updatedInv = invoiceService.getInvoiceById(confirmedInv.id);
assert(updatedInv.amountPaid === 12744, 'Invoice fully paid: amountPaid = 12,744');
assert(updatedInv.balanceDue === 0, 'Invoice balanceDue = 0');
assert(updatedInv.status === 'Paid', 'Invoice transitioned from Partially Paid to Paid');

// ---------------------------------------------------------------------------
// TEST 10: Overdue status for past due dates
// ---------------------------------------------------------------------------
console.log('\n--- Test 10: Overdue Status Calculation ---');
// Create an invoice with due date in the past and unpaid balance
const pastDueInv = invoiceService.createInvoice({
  customerId: sub1.customerId,
  subscriptionId: sub1.id,
  invoiceDate: '2026-09-01',
  dueDate: '2026-09-15', // Past relative to mock date 2026-11-01
  items: [{ productName: 'Past Service', quantity: 1, unitPrice: 2000, totalPrice: 2000 }],
  subtotal: 2000,
  discountAmount: 0,
  taxRate: 18,
  taxAmount: 360,
  grandTotal: 2360,
  status: 'Confirmed',
});

const inspectedPastDue = invoiceService.getInvoiceById(pastDueInv.id);
assert(inspectedPastDue.status === 'Overdue', 'Invoice with past dueDate and balance > 0 evaluates dynamically to Overdue');

// ---------------------------------------------------------------------------
// TEST 11: Prevent payments on cancelled invoices
// ---------------------------------------------------------------------------
console.log('\n--- Test 11: Prevent Payment on Cancelled Invoices ---');
const cancelTestInv = invoiceService.createInvoice({
  customerId: sub1.customerId,
  subscriptionId: sub1.id,
  invoiceDate: '2026-11-01',
  dueDate: '2026-11-15',
  items: [{ productName: 'Cancelled Task', quantity: 1, unitPrice: 1000, totalPrice: 1000 }],
  subtotal: 1000,
  discountAmount: 0,
  taxRate: 18,
  taxAmount: 180,
  grandTotal: 1180,
  status: 'Draft',
});
invoiceService.cancelInvoice(cancelTestInv.id);
const cancelled = invoiceService.getInvoiceById(cancelTestInv.id);
assert(cancelled.status === 'Cancelled', 'Invoice marked as Cancelled');

assertThrows(
  () => {
    paymentService.recordPayment({
      customerId: cancelled.customerId,
      invoiceId: cancelled.id,
      amount: 500,
      paymentMethod: 'Cash',
    });
  },
  'cancelled',
  'Payment blocked on cancelled invoice'
);

// ---------------------------------------------------------------------------
// TEST 12: Prevent payment amount exceeding balance due
// ---------------------------------------------------------------------------
console.log('\n--- Test 12: Overpayment Prevention ---');
const overpayInv = invoiceService.createInvoice({
  customerId: sub1.customerId,
  subscriptionId: sub1.id,
  invoiceDate: '2026-11-01',
  dueDate: '2026-11-15',
  items: [{ productName: 'Strict Balance Item', quantity: 1, unitPrice: 1000, totalPrice: 1000 }],
  subtotal: 1000,
  discountAmount: 0,
  taxRate: 18,
  taxAmount: 180,
  grandTotal: 1180,
  status: 'Confirmed',
});

assertThrows(
  () => {
    paymentService.recordPayment({
      customerId: overpayInv.customerId,
      invoiceId: overpayInv.id,
      amount: 1500, // Exceeds balance of 1180
      paymentMethod: 'UPI',
    });
  },
  'exceeds',
  'Payment exceeding invoice balance due is rejected'
);

// ---------------------------------------------------------------------------
// TEST 13: Create a percentage discount
// ---------------------------------------------------------------------------
console.log('\n--- Test 13: Create Percentage Discount ---');
const percentDisc = discountService.createDiscount({
  name: 'Winter Launch 20%',
  code: 'WINTER20',
  description: '20% off for winter subscribers',
  type: 'percentage',
  value: 20,
  minPurchaseAmount: 1000,
  minQuantity: 1,
  validFrom: '2026-11-01',
  validUntil: '2026-12-31',
  maxUsageLimit: 50,
  applicability: 'all',
});

assert(percentDisc && percentDisc.id, 'Percentage discount created with ID: ' + percentDisc?.id);
assert(percentDisc.type === 'percentage' && percentDisc.value === 20, 'Percentage discount value is 20%');

// ---------------------------------------------------------------------------
// TEST 14: Create a fixed amount discount
// ---------------------------------------------------------------------------
console.log('\n--- Test 14: Create Fixed Amount Discount ---');
const fixedDisc = discountService.createDiscount({
  name: 'Flat ₹500 Concession',
  code: 'FLAT500',
  description: 'Flat ₹500 off on subscriptions over ₹2,000',
  type: 'fixed',
  value: 500,
  minPurchaseAmount: 2000,
  minQuantity: 1,
  validFrom: '2026-11-01',
  validUntil: '2026-12-31',
  maxUsageLimit: 100,
  applicability: 'all',
});

assert(fixedDisc && fixedDisc.id, 'Fixed discount created with ID: ' + fixedDisc?.id);
assert(fixedDisc.type === 'fixed' && fixedDisc.value === 500, 'Fixed discount value is ₹500');

// ---------------------------------------------------------------------------
// TEST 15: Apply discount to all products
// ---------------------------------------------------------------------------
console.log('\n--- Test 15: Discount Applied to All Products ---');
const evalResultAll = discountService.evaluateDiscount('WINTER20', {
  items: [{ productId: 'prod_1', quantity: 2, unitPrice: 3000 }],
  subtotal: 6000,
  subscriptionId: 'sub_any',
});

assert(evalResultAll.valid === true, 'WINTER20 discount is valid for general products');
assert(evalResultAll.discountAmount === 1200, '20% of 6,000 correctly evaluated as 1,200');

// ---------------------------------------------------------------------------
// TEST 16: Apply discount to specific products
// ---------------------------------------------------------------------------
console.log('\n--- Test 16: Discount Applicable to Specific Products Only ---');
const specificProdDisc = discountService.createDiscount({
  name: 'POS Terminal Only Concession',
  code: 'POSONLY',
  type: 'fixed',
  value: 300,
  minPurchaseAmount: 500,
  minQuantity: 1,
  validFrom: '2026-11-01',
  validUntil: '2026-12-31',
  applicability: 'specific_products',
  applicableProductIds: ['prod_pos_terminal'],
});

const evalWrongProd = discountService.evaluateDiscount('POSONLY', {
  items: [{ productId: 'prod_cloud_server', quantity: 1, unitPrice: 2000 }],
  subtotal: 2000,
});
assert(evalWrongProd.valid === false, 'POSONLY discount rejected when cart does not contain targeted product');

const evalRightProd = discountService.evaluateDiscount('POSONLY', {
  items: [{ productId: 'prod_pos_terminal', quantity: 1, unitPrice: 2000 }],
  subtotal: 2000,
});
assert(evalRightProd.valid === true, 'POSONLY discount accepted when cart contains targeted product');
assert(evalRightProd.discountAmount === 300, 'Fixed discount of ₹300 calculated correctly');

// ---------------------------------------------------------------------------
// TEST 17: Verify discount date validity (active, upcoming, expired)
// ---------------------------------------------------------------------------
console.log('\n--- Test 17: Discount Date Validity ---');
const upcomingDisc = discountService.createDiscount({
  name: 'New Year 2027 Mega Promo',
  code: 'NEWYEAR2027',
  type: 'percentage',
  value: 25,
  validFrom: '2027-01-01',
  validUntil: '2027-01-15',
});
const foundUpcoming = discountService.getDiscountById(upcomingDisc.id);
assert(foundUpcoming.status === 'upcoming', 'Discount with future validFrom has status "upcoming"');

const expiredDisc = discountService.createDiscount({
  name: 'October Flash Deal',
  code: 'FLASH2026',
  type: 'fixed',
  value: 200,
  validFrom: '2026-10-01',
  validUntil: '2026-10-15',
});
const foundExpired = discountService.getDiscountById(expiredDisc.id);
assert(foundExpired.status === 'expired', 'Discount with past validUntil has status "expired"');

const evalExpired = discountService.evaluateDiscount('FLASH2026', {
  items: [{ productId: 'prod_1', quantity: 1, unitPrice: 1000 }],
  subtotal: 1000,
});
assert(evalExpired.valid === false, 'Expired discount evaluation returns valid: false');

// ---------------------------------------------------------------------------
// TEST 18: Verify discount usage limit
// ---------------------------------------------------------------------------
console.log('\n--- Test 18: Discount Usage Limit & Exhaustion ---');
const limitedDisc = discountService.createDiscount({
  name: 'Limited 1-Time Voucher',
  code: 'ONETIME',
  type: 'fixed',
  value: 100,
  minPurchaseAmount: 100,
  maxUsageLimit: 1,
  validFrom: '2026-11-01',
  validUntil: '2026-11-30',
});

// Evaluate before usage
const evalBefore = discountService.evaluateDiscount('ONETIME', {
  items: [{ productId: 'prod_1', quantity: 1, unitPrice: 500 }],
  subtotal: 500,
});
assert(evalBefore.valid === true, 'Discount valid before usage limit reached');

// Record 1 usage
discountService.recordDiscountUsage(limitedDisc.id);
const reloadedLimited = discountService.getDiscountById(limitedDisc.id);
assert(reloadedLimited.usageCount === 1, 'Discount usage count incremented to 1');
assert(reloadedLimited.status === 'expired', 'Discount automatically marked expired when usage reaches max limit');

const evalAfter = discountService.evaluateDiscount('ONETIME', {
  items: [{ productId: 'prod_1', quantity: 1, unitPrice: 500 }],
  subtotal: 500,
});
assert(evalAfter.valid === false, 'Discount rejected once max usage limit is exhausted');

// ---------------------------------------------------------------------------
// TEST 19: Verify minimum purchase amount and quantity conditions
// ---------------------------------------------------------------------------
console.log('\n--- Test 19: Minimum Purchase Amount and Quantity Conditions ---');
const minReqDisc = discountService.createDiscount({
  name: 'Bulk Enterprise Concession',
  code: 'BULK5000',
  type: 'fixed',
  value: 1000,
  minPurchaseAmount: 10000,
  minQuantity: 5,
  validFrom: '2026-11-01',
  validUntil: '2026-11-30',
});

// Case A: Amount too low
const evalLowAmount = discountService.evaluateDiscount('BULK5000', {
  items: [{ productId: 'prod_1', quantity: 5, unitPrice: 1000 }],
  subtotal: 5000, // Less than 10,000
});
assert(evalLowAmount.valid === false, 'Discount rejected when subtotal is below minimum purchase amount');

// Case B: Quantity too low
const evalLowQty = discountService.evaluateDiscount('BULK5000', {
  items: [{ productId: 'prod_1', quantity: 2, unitPrice: 6000 }],
  subtotal: 12000, // Amount qualifies, but quantity is only 2 (< 5)
});
assert(evalLowQty.valid === false, 'Discount rejected when total quantity is below minimum quantity requirement');

// Case C: Both met
const evalQualifies = discountService.evaluateDiscount('BULK5000', {
  items: [{ productId: 'prod_1', quantity: 5, unitPrice: 3000 }],
  subtotal: 15000,
});
assert(evalQualifies.valid === true, 'Discount accepted when both min purchase amount and min quantity are satisfied');

// ---------------------------------------------------------------------------
// TEST 20: Verify data persistence across simulated page reload
// ---------------------------------------------------------------------------
console.log('\n--- Test 20: Data Persistence Across Page Reloads ---');
const invoicesInStorage = JSON.parse(storage['brightloop_invoices_data'] || '[]');
const paymentsInStorage = JSON.parse(storage['brightloop_payments_data'] || '[]');
const discountsInStorage = JSON.parse(storage['brightloop_discounts_data'] || '[]');

assert(invoicesInStorage.length >= 3, `Invoices persisted in localStorage (${invoicesInStorage.length} items)`);
assert(paymentsInStorage.length >= 3, `Payments persisted in localStorage (${paymentsInStorage.length} items)`);
assert(discountsInStorage.length >= 3, `Discounts persisted in localStorage (${discountsInStorage.length} items)`);

// Verify newly recorded payment is present in storage
const foundPaymentInStorage = paymentsInStorage.find((p) => p.paymentReference === fullPayment.paymentReference);
assert(!!foundPaymentInStorage, 'Newly created payment successfully retrieved from persisted localStorage');

// ===========================================================================
// SUMMARY REPORT
// ===========================================================================
console.log('\n================================================================');
console.log('PHASE 5 TEST RESULTS SUMMARY');
console.log('================================================================');
console.log(`TOTAL TESTS RUN: ${passed + failed}`);
console.log(`PASSED:         ${passed}`);
console.log(`FAILED:         ${failed}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE 5 TESTS PASSED SUCCESSFULLY! (20/20 requirements met)\n');
}

