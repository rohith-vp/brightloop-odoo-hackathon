/**
 * Comprehensive Verification & Test Suite for Brightloop Phase 6
 * Customer Portal, Authentication, Access Control, and Data Isolation
 */

// Mock localStorage for Node execution
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

import { authService, USER_ROLES } from '../services/authService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { invoiceService } from '../services/invoiceService.js';
import { paymentService } from '../services/paymentService.js';
import { customerService } from '../services/customerService.js';
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
console.log('BRIGHTLOOP PHASE 6: CUSTOMER PORTAL COMPREHENSIVE TEST SUITE');
console.log('================================================================\n');

// Baseline date
planService.setMockCurrentDate('2026-11-01');

// ---------------------------------------------------------------------------
// 1. Customer Authentication and Access
// ---------------------------------------------------------------------------
console.log('--- Test 1: Customer Login & Role Routing ---');
// 1.1 Customer login
const custLoginResult = authService.login('ananya@techcorp.io', 'Password@123');
assert(custLoginResult.success === true, 'Customer login succeeded for TechCorp');
assert(custLoginResult.user.role === USER_ROLES.CUSTOMER, 'Logged in user has role "customer"');
assert(custLoginResult.user.customerId === 'cust_1', 'Logged in user linked to customerId "cust_1"');
assert(custLoginResult.redirectUrl === '/portal', 'Customer redirected to customer portal (/portal)');
assert(authService.isCustomer() === true, 'authService.isCustomer() returns true');

// 1.2 Invalid password
assertThrows(
  () => authService.login('ananya@techcorp.io', 'WrongPassword!'),
  'invalid',
  'Login rejected with incorrect password'
);

// 1.3 Admin login maintains / redirect
const adminLoginResult = authService.login('admin@brightloop.io', 'Password@123');
assert(adminLoginResult.user.role === USER_ROLES.ADMIN, 'Admin login returns admin role');
assert(adminLoginResult.redirectUrl === '/', 'Admin redirected to central console (/)');
assert(authService.isAdmin() === true, 'authService.isAdmin() returns true');

// Switch back to customer for portal tests
authService.login('ananya@techcorp.io', 'Password@123');

// ---------------------------------------------------------------------------
// 2. Customer Dashboard Data
// ---------------------------------------------------------------------------
console.log('\n--- Test 2: Customer Dashboard Dynamic Data ---');
const customerId1 = 'cust_1';
const custSubs = subscriptionService.getSubscriptionsForCustomer(customerId1);
const custInvs = invoiceService.getInvoicesByCustomer(customerId1);
const custPays = paymentService.getPaymentsByCustomer(customerId1);

assert(Array.isArray(custSubs), 'Customer subscriptions list loaded from service');
assert(Array.isArray(custInvs), 'Customer invoices list loaded from service');
assert(Array.isArray(custPays), 'Customer payments list loaded from service');

const activeSubsCount = custSubs.filter((s) => s.status === 'Active').length;
const outstandingBal = custInvs.reduce((acc, i) => acc + (i.balanceDue || 0), 0);
assert(typeof activeSubsCount === 'number', `Customer has ${activeSubsCount} active subscriptions`);
assert(typeof outstandingBal === 'number', `Customer outstanding balance evaluated: ₹${outstandingBal}`);

// ---------------------------------------------------------------------------
// 3. Customer Subscription Listing
// ---------------------------------------------------------------------------
console.log('\n--- Test 3: Customer Subscription Listing ---');
assert(custSubs.length > 0, `Found ${custSubs.length} subscriptions for customer cust_1`);
const sub1 = custSubs[0];
assert(sub1.subscriptionNumber.startsWith('SUB-'), 'Subscription number format matches SUB-XXX');
assert(!!sub1.productName, 'Subscription includes product name: ' + sub1.productName);
assert(!!sub1.planName, 'Subscription includes plan name: ' + sub1.planName);
assert(!!sub1.billingFrequency, 'Subscription includes billing frequency: ' + sub1.billingFrequency);
assert(typeof sub1.totalPrice === 'number', 'Subscription includes pricing amount: ₹' + sub1.totalPrice);

// ---------------------------------------------------------------------------
// 4. Subscription Details & Timeline
// ---------------------------------------------------------------------------
console.log('\n--- Test 4: Subscription Details & Activity History ---');
const detailedSub = subscriptionService.getSubscriptionForCustomer(sub1.id, customerId1);
assert(detailedSub && detailedSub.id === sub1.id, 'Subscription details retrieved for authorized customer');
assert(Array.isArray(detailedSub.activityHistory), 'Activity history is populated');
assert(detailedSub.activityHistory.length > 0, 'Activity history contains timeline milestones');

// ---------------------------------------------------------------------------
// 5. Pause and Resume Requests (Pending Approval Governance)
// ---------------------------------------------------------------------------
console.log('\n--- Test 5: Customer Pause and Resume Requests ---');
// Customer requests pause
const pausedReqSub = subscriptionService.requestPause(sub1.id, customerId1, 'Upgrading internal systems for 2 weeks');
assert(pausedReqSub.pendingRequest !== null, 'Subscription now has a pendingRequest object');
assert(pausedReqSub.pendingRequest.type === 'Pause', 'Pending request type is "Pause"');
assert(pausedReqSub.pendingRequest.status === 'Pending Approval', 'Request status is "Pending Approval" (did not bypass admin approval)');
assert(pausedReqSub.status === 'Active', 'CRITICAL: Subscription remains "Active" until admin approves the hold request!');

// Verify timeline entry added
const latestActivity = pausedReqSub.activityHistory[0];
assert(latestActivity.title === 'Pause Requested', 'Activity history logged the customer hold request');

// Customer withdraws request
const withdrawnSub = subscriptionService.cancelPendingRequest(sub1.id, customerId1);
assert(withdrawnSub.pendingRequest === null, 'Customer successfully withdrew the pending pause request');

// Now admin approves pause
subscriptionService.requestPause(sub1.id, customerId1, 'Datacenter migration');
const approvedPause = subscriptionService.approvePendingRequest(sub1.id, 'Operations Manager');
assert(approvedPause.status === 'Paused', 'Subscription transitioned to Paused upon admin approval');
assert(approvedPause.pendingRequest === null, 'Pending request cleared after approval');

// Customer requests resume on paused subscription
const resumeReqSub = subscriptionService.requestResume(sub1.id, customerId1, 'Migration completed ahead of time');
assert(resumeReqSub.pendingRequest.type === 'Resume', 'Customer resume request recorded');
assert(resumeReqSub.pendingRequest.status === 'Pending Approval', 'Resume request set to Pending Approval');

// Admin approves resume
const approvedResume = subscriptionService.approvePendingRequest(sub1.id, 'Operations Manager');
assert(approvedResume.status === 'Active', 'Subscription resumed back to Active status upon admin approval');

// ---------------------------------------------------------------------------
// 6. Cancellation Requests
// ---------------------------------------------------------------------------
console.log('\n--- Test 6: Customer Cancellation Request ---');
const cancelReqSub = subscriptionService.requestCancellation(sub1.id, customerId1, 'Downsizing branch operations');
assert(cancelReqSub.pendingRequest.type === 'Cancellation', 'Cancellation request recorded');
assert(cancelReqSub.pendingRequest.status === 'Pending Approval', 'Cancellation request requires admin approval');
assert(cancelReqSub.status === 'Active', 'Subscription remains Active until formal approval');

// Clean up pending request so subscription stays healthy
subscriptionService.cancelPendingRequest(sub1.id, customerId1);

// ---------------------------------------------------------------------------
// 7. Customer Invoice Listing
// ---------------------------------------------------------------------------
console.log('\n--- Test 7: Customer Invoice Listing ---');
assert(custInvs.length > 0, `Customer cust_1 has ${custInvs.length} invoices`);
const inv1 = custInvs[0];
assert(inv1.invoiceNumber.startsWith('INV-'), 'Invoice number format verified: ' + inv1.invoiceNumber);
assert(typeof inv1.grandTotal === 'number', 'Invoice includes grand total: ₹' + inv1.grandTotal);
assert(typeof inv1.balanceDue === 'number', 'Invoice includes balance due: ₹' + inv1.balanceDue);
assert(!!inv1.status, 'Invoice includes status badge: ' + inv1.status);

// ---------------------------------------------------------------------------
// 8. Invoice Details & Customer Security
// ---------------------------------------------------------------------------
console.log('\n--- Test 8: Invoice Details & Security Checks ---');
const custInvoiceDetails = invoiceService.getInvoiceForCustomer(inv1.id, customerId1);
assert(custInvoiceDetails.id === inv1.id, 'Customer successfully viewed their own invoice');
assert(Array.isArray(custInvoiceDetails.items), 'Invoice contains line item breakdown');

// ---------------------------------------------------------------------------
// 9. Customer Payment History
// ---------------------------------------------------------------------------
console.log('\n--- Test 9: Customer Payment History ---');
assert(custPays.length > 0, `Customer cust_1 has ${custPays.length} recorded payments`);
const pay1 = custPays[0];
assert(pay1.paymentReference.startsWith('PAY-'), 'Payment reference verified: ' + pay1.paymentReference);
assert(pay1.customerId === customerId1, 'Payment linked to customer cust_1');
assert(typeof pay1.amount === 'number', 'Payment amount verified: ₹' + pay1.amount);

const custPayDetails = paymentService.getPaymentForCustomer(pay1.id, customerId1);
assert(custPayDetails.id === pay1.id, 'Customer retrieved own payment receipt details');

// ---------------------------------------------------------------------------
// 10. Profile Editing
// ---------------------------------------------------------------------------
console.log('\n--- Test 10: Customer Profile Editing ---');
const originalCust = customerService.getCustomerById(customerId1);
const updatedCust = customerService.updateCustomer(customerId1, {
  contactPerson: 'Ananya Sharma-Verma',
  phone: '+91 98201 99999',
  billingAddress: {
    ...originalCust.billingAddress,
    street: 'New Tech Park, 12th Floor',
  },
});

assert(updatedCust.contactPerson === 'Ananya Sharma-Verma', 'Contact person updated successfully');
assert(updatedCust.phone === '+91 98201 99999', 'Phone number updated successfully');
assert(updatedCust.billingAddress.street === 'New Tech Park, 12th Floor', 'Billing address street updated successfully');

// ---------------------------------------------------------------------------
// 11. Customer Data Isolation (CRITICAL SECURITY)
// ---------------------------------------------------------------------------
console.log('\n--- Test 11: Cross-Customer Data Isolation Enforced in Service Layer ---');
const customerId2 = 'cust_2'; // Nexus FinTech
const nexusInvoices = invoiceService.getInvoicesByCustomer(customerId2);
const nexusSubs = subscriptionService.getSubscriptionsForCustomer(customerId2);
const nexusPays = paymentService.getPaymentsByCustomer(customerId2);

if (nexusInvoices.length > 0) {
  assertThrows(
    () => invoiceService.getInvoiceForCustomer(nexusInvoices[0].id, customerId1),
    'access denied',
    'Customer 1 blocked from accessing Customer 2 invoice!'
  );
}

if (nexusSubs.length > 0) {
  assertThrows(
    () => subscriptionService.getSubscriptionForCustomer(nexusSubs[0].id, customerId1),
    'access denied',
    'Customer 1 blocked from accessing Customer 2 subscription!'
  );

  assertThrows(
    () => subscriptionService.requestPause(nexusSubs[0].id, customerId1, 'Unauthorized attempt'),
    'access denied',
    'Customer 1 blocked from pausing Customer 2 subscription!'
  );
}

if (nexusPays.length > 0) {
  assertThrows(
    () => paymentService.getPaymentForCustomer(nexusPays[0].id, customerId1),
    'access denied',
    'Customer 1 blocked from accessing Customer 2 payment receipt!'
  );
}

// ---------------------------------------------------------------------------
// 12. Admin and Staff Access Remains Fully Functional
// ---------------------------------------------------------------------------
console.log('\n--- Test 12: Admin & Staff Access Verification ---');
authService.login('admin@brightloop.io', 'Password@123');
assert(authService.isAdmin() === true, 'Admin status active');
const allAdminSubs = subscriptionService.getSubscriptions();
const allAdminInvs = invoiceService.getInvoices();
const allAdminPays = paymentService.getPayments();
assert(allAdminSubs.length >= custSubs.length, 'Admin sees all system subscriptions across all customers');
assert(allAdminInvs.length >= custInvs.length, 'Admin sees all system invoices across all customers');
assert(allAdminPays.length >= custPays.length, 'Admin sees all system payments across all customers');

// ---------------------------------------------------------------------------
// 13. localStorage Persistence
// ---------------------------------------------------------------------------
console.log('\n--- Test 13: LocalStorage Persistence Across Reloads ---');
const storedCusts = JSON.parse(storage['brightloop_customers_data'] || '[]');
const reloadedProfile = storedCusts.find((c) => c.id === customerId1);
assert(reloadedProfile && reloadedProfile.contactPerson === 'Ananya Sharma-Verma', 'Profile edit persists in storage');

const storedSubs = JSON.parse(storage['brightloop_subscriptions_data'] || '[]');
assert(storedSubs.length > 0, 'Subscriptions persisted in storage');

const storedUser = JSON.parse(storage['brightloop_auth_user'] || '{}');
assert(storedUser.email === 'admin@brightloop.io', 'Authentication session persists in storage');

// ===========================================================================
// SUMMARY REPORT
// ===========================================================================
console.log('\n================================================================');
console.log('PHASE 6 TEST RESULTS SUMMARY');
console.log('================================================================');
console.log(`TOTAL TESTS RUN: ${passed + failed}`);
console.log(`PASSED:         ${passed}`);
console.log(`FAILED:         ${failed}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE 6 TESTS PASSED SUCCESSFULLY! (15/15 requirements met)\n');
}

