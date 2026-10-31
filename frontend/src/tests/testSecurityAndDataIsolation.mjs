/**
 * Comprehensive Security & Customer Data-Isolation Audit Test Suite
 * Brightloop Subscription Management System
 */

// Global localStorage mock for headless Node execution
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
      console.error(`[FAIL] Threw unexpected error: "${err.message}", expected substring: "${expectedSubstring}"`);
    }
  }
}

console.log('================================================================');
console.log('BRIGHTLOOP SECURITY & DATA-ISOLATION AUDIT SUITE');
console.log('================================================================\n');

// Set test baseline date
planService.setMockCurrentDate('2026-11-01');

// ===========================================================================
// SECTION 1: Prepare Test Customers (Alice, Bob, Charlie)
// ===========================================================================
console.log('--- Section 1: Verifying Test Customer Preparation ---');
const custAlice = customerService.getCustomerById('CUST001');
const custBob = customerService.getCustomerById('CUST002');
const custCharlie = customerService.getCustomerById('CUST003');

assert(custAlice && custAlice.name === 'Alice' && custAlice.email === 'alice@example.com', 'Customer A (Alice) verified');
assert(custBob && custBob.name === 'Bob' && custBob.email === 'bob@example.com', 'Customer B (Bob) verified');
assert(custCharlie && custCharlie.name === 'Charlie' && custCharlie.email === 'charlie@example.com', 'Customer C (Charlie) verified');

// Verify at least two subscriptions each
const aliceSubs = subscriptionService.getSubscriptionsForCustomer('CUST001');
const bobSubs = subscriptionService.getSubscriptionsForCustomer('CUST002');
const charlieSubs = subscriptionService.getSubscriptionsForCustomer('CUST003');

assert(aliceSubs.length >= 2, `Customer A (Alice) has ${aliceSubs.length} subscriptions (>= 2)`);
assert(bobSubs.length >= 2, `Customer B (Bob) has ${bobSubs.length} subscriptions (>= 2)`);
assert(charlieSubs.length >= 2, `Customer C (Charlie) has ${charlieSubs.length} subscriptions (>= 2)`);

// Verify at least two invoices each
const aliceInvs = invoiceService.getInvoicesByCustomer('CUST001');
const bobInvs = invoiceService.getInvoicesByCustomer('CUST002');
const charlieInvs = invoiceService.getInvoicesByCustomer('CUST003');

assert(aliceInvs.length >= 2, `Customer A (Alice) has ${aliceInvs.length} invoices (>= 2)`);
assert(bobInvs.length >= 2, `Customer B (Bob) has ${bobInvs.length} invoices (>= 2)`);
assert(charlieInvs.length >= 2, `Customer C (Charlie) has ${charlieInvs.length} invoices (>= 2)`);

// Verify at least two payments each
const alicePays = paymentService.getPaymentsByCustomer('CUST001');
const bobPays = paymentService.getPaymentsByCustomer('CUST002');
const charliePays = paymentService.getPaymentsByCustomer('CUST003');

assert(alicePays.length >= 2, `Customer A (Alice) has ${alicePays.length} payment records (>= 2)`);
assert(bobPays.length >= 2, `Customer B (Bob) has ${bobPays.length} payment records (>= 2)`);
assert(charliePays.length >= 2, `Customer C (Charlie) has ${charliePays.length} payment records (>= 2)`);

// ===========================================================================
// SECTION 2: Test Subscription Isolation Across All Customers
// ===========================================================================
console.log('\n--- Section 2: Subscription Data Isolation & Access Controls ---');
// 2.1 Customer A (Alice)
authService.login('alice@example.com', 'Password@123');
const aliceMySubs = subscriptionService.getMySubscriptions();
assert(
  aliceMySubs.every((s) => s.customerId === 'CUST001' || s.customer?.id === 'CUST001'),
  'Customer A sees only their own subscriptions via getMySubscriptions()'
);
assert(
  !aliceMySubs.some((s) => s.customerId === 'CUST002' || s.customerId === 'CUST003'),
  'Customer A cannot see any of Customer B or C subscriptions in listing'
);

// Attempt direct access to Bob's subscription while logged in as Alice
assertThrows(
  () => subscriptionService.getMySubscriptionById(bobSubs[0].id),
  'access denied',
  'Customer A blocked from retrieving Customer B subscription by ID'
);
assertThrows(
  () => subscriptionService.getSubscriptionForCustomer(bobSubs[0].id, 'CUST001'),
  'access denied',
  'Service rejects Customer A querying Customer B subscription with customerId CUST001'
);

// Attempt modifying Bob's subscription while logged in as Alice
assertThrows(
  () => subscriptionService.requestMySubscriptionPause(bobSubs[0].id, 'Malicious pause attempt'),
  'access denied',
  'Customer A blocked from requesting pause on Customer B subscription'
);
assertThrows(
  () => subscriptionService.requestPause(bobSubs[0].id, 'CUST001', 'Malicious pause attempt'),
  'access denied',
  'Service rejects requestPause for Customer B subscription by Customer A'
);
assertThrows(
  () => subscriptionService.requestCancellation(bobSubs[0].id, 'CUST001', 'Malicious cancel attempt'),
  'access denied',
  'Service rejects requestCancellation for Customer B subscription by Customer A'
);

// 2.2 Customer B (Bob)
authService.login('bob@example.com', 'Password@123');
const bobMySubs = subscriptionService.getMySubscriptions();
assert(
  bobMySubs.every((s) => s.customerId === 'CUST002' || s.customer?.id === 'CUST002'),
  'Customer B sees only their own subscriptions via getMySubscriptions()'
);
assertThrows(
  () => subscriptionService.getMySubscriptionById(aliceSubs[0].id),
  'access denied',
  'Customer B blocked from retrieving Customer A subscription by ID'
);
assertThrows(
  () => subscriptionService.getMySubscriptionById(charlieSubs[0].id),
  'access denied',
  'Customer B blocked from retrieving Customer C subscription by ID'
);

// 2.3 Customer C (Charlie)
authService.login('charlie@example.com', 'Password@123');
const charlieMySubs = subscriptionService.getMySubscriptions();
assert(
  charlieMySubs.every((s) => s.customerId === 'CUST003' || s.customer?.id === 'CUST003'),
  'Customer C sees only their own subscriptions via getMySubscriptions()'
);
assertThrows(
  () => subscriptionService.getMySubscriptionById(aliceSubs[0].id),
  'access denied',
  'Customer C blocked from retrieving Customer A subscription by ID'
);
assertThrows(
  () => subscriptionService.getMySubscriptionById(bobSubs[0].id),
  'access denied',
  'Customer C blocked from retrieving Customer B subscription by ID'
);

// ===========================================================================
// SECTION 3: Test Invoice Isolation Across All Customers
// ===========================================================================
console.log('\n--- Section 3: Invoice Data Isolation & Access Controls ---');
// 3.1 Customer A (Alice)
authService.login('alice@example.com', 'Password@123');
const aliceMyInvs = invoiceService.getMyInvoices();
assert(
  aliceMyInvs.every((i) => i.customerId === 'CUST001' || i.customer?.id === 'CUST001'),
  'Customer A sees only their own invoices via getMyInvoices()'
);
assert(
  !aliceMyInvs.some((i) => i.customerId === 'CUST002' || i.customerId === 'CUST003'),
  'Customer A invoice list excludes Customer B and C records'
);

// Attempt direct retrieval of Bob's invoice by Alice
assertThrows(
  () => invoiceService.getMyInvoiceById(bobInvs[0].id),
  'access denied',
  'Customer A blocked from retrieving Customer B invoice via getMyInvoiceById()'
);
assertThrows(
  () => invoiceService.getInvoiceForCustomer(bobInvs[0].id, 'CUST001'),
  'access denied',
  'Customer A blocked from accessing Customer B invoice with customerId CUST001'
);

// Attempt editing or deleting another customer's invoice
assertThrows(
  () => invoiceService.updateInvoice(bobInvs[0].id, { notes: 'Tampered by Alice' }),
  'access denied',
  'Customer A blocked from updating Customer B invoice'
);
assertThrows(
  () => invoiceService.deleteInvoice(bobInvs[0].id),
  'access denied',
  'Customer A blocked from deleting Customer B invoice'
);

// 3.2 Customer B (Bob)
authService.login('bob@example.com', 'Password@123');
const bobMyInvs = invoiceService.getMyInvoices();
assert(
  bobMyInvs.every((i) => i.customerId === 'CUST002' || i.customer?.id === 'CUST002'),
  'Customer B sees only their own invoices'
);
assertThrows(
  () => invoiceService.getMyInvoiceById(aliceInvs[0].id),
  'access denied',
  'Customer B blocked from retrieving Customer A invoice'
);
assertThrows(
  () => invoiceService.getMyInvoiceById(charlieInvs[0].id),
  'access denied',
  'Customer B blocked from retrieving Customer C invoice'
);

// 3.3 Customer C (Charlie)
authService.login('charlie@example.com', 'Password@123');
const charlieMyInvs = invoiceService.getMyInvoices();
assert(
  charlieMyInvs.every((i) => i.customerId === 'CUST003' || i.customer?.id === 'CUST003'),
  'Customer C sees only their own invoices'
);
assertThrows(
  () => invoiceService.getMyInvoiceById(aliceInvs[0].id),
  'access denied',
  'Customer C blocked from retrieving Customer A invoice'
);

// ===========================================================================
// SECTION 4: Test Payment Isolation Across All Customers
// ===========================================================================
console.log('\n--- Section 4: Payment Data Isolation & Access Controls ---');
// 4.1 Customer A (Alice)
authService.login('alice@example.com', 'Password@123');
const aliceMyPays = paymentService.getMyPayments();
assert(
  aliceMyPays.every((p) => p.customerId === 'CUST001'),
  'Customer A sees only their own payment receipts via getMyPayments()'
);
assert(
  !aliceMyPays.some((p) => p.customerId === 'CUST002' || p.customerId === 'CUST003'),
  'Customer A payment list excludes Customer B and C transactions'
);

// Attempt direct retrieval of Bob's payment
assertThrows(
  () => paymentService.getMyPaymentById(bobPays[0].id),
  'access denied',
  'Customer A blocked from accessing Customer B payment receipt by ID'
);
assertThrows(
  () => paymentService.getPaymentForCustomer(bobPays[0].id, 'CUST001'),
  'access denied',
  'Customer A blocked from retrieving Customer B payment receipt via getPaymentForCustomer'
);

// Attempt deleting another customer's payment
assertThrows(
  () => paymentService.deletePayment(bobPays[0].id),
  'access denied',
  'Customer A blocked from deleting payment records'
);

// 4.2 Customer B (Bob)
authService.login('bob@example.com', 'Password@123');
assertThrows(
  () => paymentService.getMyPaymentById(alicePays[0].id),
  'access denied',
  'Customer B blocked from accessing Customer A payment receipt'
);
assertThrows(
  () => paymentService.getMyPaymentById(charliePays[0].id),
  'access denied',
  'Customer B blocked from accessing Customer C payment receipt'
);

// 4.3 Customer C (Charlie)
authService.login('charlie@example.com', 'Password@123');
assertThrows(
  () => paymentService.getMyPaymentById(alicePays[0].id),
  'access denied',
  'Customer C blocked from accessing Customer A payment receipt'
);

// ===========================================================================
// SECTION 5: Test Profile Isolation & Privilege Escalation Prevention
// ===========================================================================
console.log('\n--- Section 5: Profile Isolation & Role Tampering Prevention ---');
// 5.1 Customer A (Alice) views profile
authService.login('alice@example.com', 'Password@123');
const aliceProfile = customerService.getMyProfile();
assert(aliceProfile && aliceProfile.id === 'CUST001', 'Customer A retrieves own profile');

// Edit permitted profile information
const updatedAlice = customerService.updateMyProfile({
  contactPerson: 'Alice H. (Updated)',
  phone: '+91 98200 99999',
  billingAddress: {
    street: '102 Cyber Park High Street',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411045',
    country: 'India',
  },
});
assert(updatedAlice.contactPerson === 'Alice H. (Updated)', 'Permitted contact person updated');
assert(updatedAlice.phone === '+91 98200 99999', 'Permitted phone number updated');
assert(updatedAlice.billingAddress.street === '102 Cyber Park High Street', 'Permitted billing street updated');

// Attempt privilege escalation or ID tampering
const maliciousAttempt = customerService.updateMyProfile({
  id: 'CUST002', // Attempting to modify Bob
  role: 'admin',  // Attempting to escalate role
  email: 'admin@brightloop.io', // Attempting to steal admin email
});
assert(maliciousAttempt.id === 'CUST001', 'IMMUTABILITY: Customer ID was not overwritten to CUST002');
assert(maliciousAttempt.email === 'alice@example.com', 'IMMUTABILITY: Customer email was not overwritten');
assert(authService.getCurrentUser().role === USER_ROLES.CUSTOMER, 'IMMUTABILITY: Customer role was not escalated to admin');

// ===========================================================================
// SECTION 6: Authentication & Session Isolation
// ===========================================================================
console.log('\n--- Section 6: Authentication & Session Isolation ---');
// 6.1 Log in as Customer A
authService.login('alice@example.com', 'Password@123');
assert(authService.getCurrentUser().email === 'alice@example.com', 'Logged in as Alice');

// 6.2 Log out
authService.logout();
assert(authService.getCurrentUser() === null, 'Session cleared on logout');
assert(authService.isAuthenticated() === false, 'isAuthenticated() is false after logout');

// Verify calling customer endpoints while logged out is rejected
assertThrows(
  () => subscriptionService.getMySubscriptions(),
  'unauthorized',
  'Unauthenticated call to getMySubscriptions() is rejected'
);
assertThrows(
  () => invoiceService.getMyInvoices(),
  'unauthorized',
  'Unauthenticated call to getMyInvoices() is rejected'
);
assertThrows(
  () => paymentService.getMyPayments(),
  'unauthorized',
  'Unauthenticated call to getMyPayments() is rejected'
);
assertThrows(
  () => customerService.getMyProfile(),
  'unauthorized',
  'Unauthenticated call to getMyProfile() is rejected'
);

// 6.3 Log in as Customer B
authService.login('bob@example.com', 'Password@123');
assert(authService.getCurrentUser().email === 'bob@example.com', 'Logged in as Bob');
const bobProfile = customerService.getMyProfile();
assert(bobProfile.id === 'CUST002', 'Customer B profile loaded (not Customer A cached data)');

// ===========================================================================
// SECTION 7: Role-Based Access Controls (RBAC)
// ===========================================================================
console.log('\n--- Section 7: Role-Based Access Controls ---');
// 7.1 Customer role checks
authService.login('alice@example.com', 'Password@123');
assert(authService.isCustomer() === true, 'Alice isCustomer() is true');
assert(authService.isAdmin() === false, 'Alice isAdmin() is false');
assert(authService.isStaff() === false, 'Alice isStaff() is false');

// 7.2 Staff role checks
authService.login('staff@brightloop.io', 'Password@123');
assert(authService.isCustomer() === false, 'Staff isCustomer() is false');
assert(authService.isAdmin() === false, 'Staff isAdmin() is false');
assert(authService.isStaff() === true, 'Staff isStaff() is true');

// 7.3 Admin role checks
authService.login('admin@brightloop.io', 'Password@123');
assert(authService.isAdmin() === true, 'Admin isAdmin() is true');
assert(authService.isStaff() === true, 'Admin has staff management authority');
assert(authService.isCustomer() === false, 'Admin isCustomer() is false');

// ===========================================================================
// SECTION 8: Direct Data Access Verification
// ===========================================================================
console.log('\n--- Section 8: Direct Data Access via Session-Derived Functions ---');
authService.login('alice@example.com', 'Password@123');

// 8.1 getMySubscriptions()
const subsDirect = subscriptionService.getMySubscriptions();
assert(subsDirect.length === aliceSubs.length, 'getMySubscriptions() derived customer ID from authenticated session');

// 8.2 getMySubscriptionById()
const subItem = subscriptionService.getMySubscriptionById(aliceSubs[0].id);
assert(subItem.id === aliceSubs[0].id, 'getMySubscriptionById() loaded authenticated subscription');

// 8.3 getMyInvoices()
const invsDirect = invoiceService.getMyInvoices();
assert(invsDirect.length === aliceInvs.length, 'getMyInvoices() derived customer ID from authenticated session');

// 8.4 getMyInvoiceById()
const invItem = invoiceService.getMyInvoiceById(aliceInvs[0].id);
assert(invItem.id === aliceInvs[0].id, 'getMyInvoiceById() loaded authenticated invoice');

// 8.5 getMyPayments()
const paysDirect = paymentService.getMyPayments();
assert(paysDirect.length === alicePays.length, 'getMyPayments() derived customer ID from authenticated session');

// 8.6 getMyPaymentById()
const payItem = paymentService.getMyPaymentById(alicePays[0].id);
assert(payItem.id === alicePays[0].id, 'getMyPaymentById() loaded authenticated payment');

// ===========================================================================
// SECTION 9: Data Integrity & Cross-Customer Isolation
// ===========================================================================
console.log('\n--- Section 9: Data Integrity Verification ---');
// Verify every invoice belongs to correct customer
const allInvoices = invoiceService.getInvoices();
const aliceInvoicesOnly = allInvoices.filter((i) => i.invoiceNumber.includes('ALICE'));
assert(
  aliceInvoicesOnly.every((i) => i.customerId === 'CUST001'),
  'All Alice invoices strictly belong to CUST001'
);

// Verify every payment belongs to correct invoice and customer
const allPayments = paymentService.getPayments();
const alicePaymentsOnly = allPayments.filter((p) => p.paymentReference.includes('ALICE'));
assert(
  alicePaymentsOnly.every((p) => p.customerId === 'CUST001' && p.invoiceId.includes('alice')),
  'All Alice payments belong to CUST001 and Alice invoices'
);

// Deleting one customer's subscription does not affect another's
authService.login('admin@brightloop.io', 'Password@123'); // Admin deletes closed subscription
const charlieClosedSub = charlieSubs.find((s) => s.status === 'Closed');
if (charlieClosedSub) {
  subscriptionService.deleteSubscription(charlieClosedSub.id);
  const remainingAliceSubs = subscriptionService.getSubscriptionsForCustomer('CUST001');
  assert(remainingAliceSubs.length === aliceSubs.length, 'Deleting Charlie closed subscription did not affect Alice subscriptions');
}

// ===========================================================================
// SECTION 10: LocalStorage Persistence
// ===========================================================================
console.log('\n--- Section 10: LocalStorage Persistence & Isolation ---');
const storedCustomerData = JSON.parse(storage['brightloop_customers_data'] || '[]');
const storedAlice = storedCustomerData.find((c) => c.id === 'CUST001');
assert(storedAlice && storedAlice.contactPerson === 'Alice H. (Updated)', 'Alice profile update persisted in localStorage');

// ===========================================================================
// SUMMARY REPORT
// ===========================================================================
console.log('\n================================================================');
console.log('SECURITY & DATA-ISOLATION AUDIT SUMMARY');
console.log('================================================================');
console.log(`TOTAL SECURITY CHECKS: ${passed + failed}`);
console.log(`PASSED:               ${passed}`);
console.log(`FAILED:               ${failed}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL DATA-ISOLATION & SECURITY AUDIT CHECKS PASSED (100%)!\n');
}
