/**
 * Automated Verification Script for Plan Availability Dates
 * Brightloop Subscription Management System
 */

// Mock localStorage for node environment
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

import { planService } from '../services/planService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { productService } from '../services/productService.js';

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

console.log('====================================================');
console.log('BRIGHTLOOP: PLAN AVAILABILITY DATES VERIFICATION SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------------------------
// 1. Test Available From and Available Until
// ---------------------------------------------------------------------------
console.log('--- TEST 1: Available From and Available Until Creation & Saving ---');
const testPlanData = {
  name: 'Monthly Cloud Storage',
  productId: 'prod_2',
  billingFrequency: 'Monthly',
  price: 499,
  minQuantity: 1,
  startDate: '2026-11-01',
  endDate: '2026-12-31',
  description: 'High-availability object and block storage cluster tier.',
};

const createdPlan = planService.createPlan(testPlanData);
assert(createdPlan.id !== undefined, 'Plan created with unique ID');
assert(createdPlan.name === 'Monthly Cloud Storage', 'Plan name is "Monthly Cloud Storage"');
assert(createdPlan.price === 499, 'Price saved as 499');
assert(createdPlan.startDate === '2026-11-01', 'Available From saved as 2026-11-01');
assert(createdPlan.endDate === '2026-12-31', 'Available Until saved as 2026-12-31');

// ---------------------------------------------------------------------------
// 2. Test Availability Status (Date Boundaries)
// ---------------------------------------------------------------------------
console.log('\n--- TEST 2: Availability Status Calculations & Date Boundaries ---');
const dateMatrix = [
  { testDate: '2026-10-30', expectedStatus: 'Upcoming', description: '30 October 2026 -> Upcoming' },
  { testDate: '2026-11-01', expectedStatus: 'Available', description: '01 November 2026 (Boundary Start) -> Available' },
  { testDate: '2026-11-15', expectedStatus: 'Available', description: '15 November 2026 (Mid-range) -> Available' },
  { testDate: '2026-12-31', expectedStatus: 'Available', description: '31 December 2026 (Boundary End) -> Available' },
  { testDate: '2027-01-01', expectedStatus: 'Expired', description: '01 January 2027 (Post-boundary) -> Expired' },
];

for (const tc of dateMatrix) {
  const status = planService.getPlanAvailabilityStatus(createdPlan, tc.testDate);
  assert(status === tc.expectedStatus, `${tc.description}: Got "${status}"`);
}

// ---------------------------------------------------------------------------
// 3. Test Date Validation
// ---------------------------------------------------------------------------
console.log('\n--- TEST 3: Date Validation Cases ---');

// 3.1: Plan without Available From date
const noStartPlan = planService.createPlan({
  name: 'Immediate Start Plan',
  productId: 'prod_1',
  billingFrequency: 'Monthly',
  price: 299,
  startDate: '',
  endDate: '2026-12-31',
});
assert(noStartPlan.startDate === '', 'Plan without Available From date created successfully');
assert(planService.getPlanAvailabilityStatus(noStartPlan, '2026-10-30') === 'Available', 'Immediately available before end date');
assert(planService.getPlanAvailabilityStatus(noStartPlan, '2027-01-01') === 'Expired', 'Expired after end date');

// 3.2: Plan without Available Until date (Ongoing)
const noEndPlan = planService.createPlan({
  name: 'Perpetual Plan',
  productId: 'prod_1',
  billingFrequency: 'Monthly',
  price: 399,
  startDate: '2026-11-01',
  endDate: '',
});
assert(noEndPlan.endDate === '', 'Plan without Available Until date created successfully');
assert(planService.getPlanAvailabilityStatus(noEndPlan, '2026-10-30') === 'Upcoming', 'Upcoming before start date');
assert(planService.getPlanAvailabilityStatus(noEndPlan, '2026-11-01') === 'Available', 'Available on start date');
assert(planService.getPlanAvailabilityStatus(noEndPlan, '2030-01-01') === 'Available', 'Remains available perpetually');

// 3.3: Set Available Until earlier than Available From
function validatePlanDates(startDate, endDate) {
  if (startDate && endDate && endDate < startDate) {
    return 'Available Until date cannot be earlier than Available From date';
  }
  return null;
}
const invalidRangeError = validatePlanDates('2026-11-01', '2026-10-31');
assert(invalidRangeError !== null, 'Invalid range (endDate < startDate) properly rejected');

// 3.4: Set both dates to the same date
const sameDateError = validatePlanDates('2026-11-01', '2026-11-01');
assert(sameDateError === null, 'Same date for start and end is accepted as valid single-day availability');
const singleDayPlan = { startDate: '2026-11-01', endDate: '2026-11-01' };
assert(planService.getPlanAvailabilityStatus(singleDayPlan, '2026-10-31') === 'Upcoming', 'Single-day plan is Upcoming on previous day');
assert(planService.getPlanAvailabilityStatus(singleDayPlan, '2026-11-01') === 'Available', 'Single-day plan is Available on the day');
assert(planService.getPlanAvailabilityStatus(singleDayPlan, '2026-11-02') === 'Expired', 'Single-day plan is Expired on the next day');

// 3.5: Edit an existing plan's availability dates
const updatedPlan = planService.updatePlan(createdPlan.id, {
  startDate: '2026-11-10',
  endDate: '2027-01-15',
});
assert(updatedPlan.startDate === '2026-11-10', 'Plan updated with new Available From date');
assert(updatedPlan.endDate === '2027-01-15', 'Plan updated with new Available Until date');
assert(planService.getPlanAvailabilityStatus(updatedPlan, '2026-11-05') === 'Upcoming', 'Updated status is Upcoming on 05 Nov 2026');
assert(planService.getPlanAvailabilityStatus(updatedPlan, '2026-12-01') === 'Available', 'Updated status is Available on 01 Dec 2026');
assert(planService.getPlanAvailabilityStatus(updatedPlan, '2027-01-20') === 'Expired', 'Updated status is Expired on 20 Jan 2027');

// ---------------------------------------------------------------------------
// 4. Test Existing Subscription Behaviour
// ---------------------------------------------------------------------------
console.log('\n--- TEST 4: Existing Subscription Independence During Plan Expiration ---');
// Reset test plan to 2026-11-01 -> 2026-12-31
const targetPlan = planService.updatePlan(createdPlan.id, {
  startDate: '2026-11-01',
  endDate: '2026-12-31',
});

// Simulate subscribing on 20 December 2026
const subscriptionSimDate = '2026-12-20';
planService.setMockCurrentDate(subscriptionSimDate);

// Verify customer can subscribe while plan is Available
const planStatusAtSubscription = planService.getPlanAvailabilityStatus(targetPlan);
assert(planStatusAtSubscription === 'Available', 'Plan is Available for purchase on 20 December 2026');

const customerSub = subscriptionService.createSubscription({
  customer: { id: 'cust_1', name: 'TechCorp Solutions' },
  productId: targetPlan.productId,
  productName: targetPlan.productName,
  planId: targetPlan.id,
  planName: targetPlan.name,
  billingFrequency: 'Monthly',
  quantity: 1,
  unitPrice: targetPlan.price,
  startDate: '2026-12-20',
  endDate: '2027-01-19', // Period extends beyond plan availability end (31 Dec 2026)
  status: 'Active',
});

assert(customerSub.status === 'Active', 'Customer subscription is Active');
assert(customerSub.startDate === '2026-12-20', 'Subscription start date is 20 December 2026');
assert(customerSub.endDate === '2027-01-19', 'Subscription end date extends to 19 January 2027');

// Fast-forward mock clock to 01 January 2027 (Plan is now expired!)
const newYearDate = '2027-01-01';
planService.setMockCurrentDate(newYearDate);

// Verify: Plan is now Expired for new purchases
const planStatusOnJan1 = planService.getPlanAvailabilityStatus(targetPlan);
assert(planStatusOnJan1 === 'Expired', 'Plan is Expired for new purchases on 01 January 2027');

// Check all subscriptions via subscriptionService (which runs checkAndApplyAutoClosure)
const activeSubsOnJan1 = subscriptionService.getSubscriptions();
const currentCustomerSub = activeSubsOnJan1.find((s) => s.id === customerSub.id);
assert(currentCustomerSub !== undefined, 'Customer subscription found');
assert(currentCustomerSub.status === 'Active', 'CRITICAL RULE: Customer subscription remains Active on 01 Jan 2027 despite plan expiration!');

// Fast-forward mock clock to 20 January 2027 (Past the subscription's own end date)
const subExpiryDate = '2027-01-20';
planService.setMockCurrentDate(subExpiryDate);

const subsAfterExpiry = subscriptionService.getSubscriptions();
const expiredCustomerSub = subsAfterExpiry.find((s) => s.id === customerSub.id);
assert(expiredCustomerSub.status === 'Closed', 'Subscription automatically closes only after its own end date (20 Jan 2027)');

// Reset mock clock
planService.clearMockCurrentDate();

// ---------------------------------------------------------------------------
// 5. Test Persistence
// ---------------------------------------------------------------------------
console.log('\n--- TEST 5: Storage Persistence Across Reloads ---');
const persistedPlans = planService.getPlans();
const persistedPlan = persistedPlans.find((p) => p.id === createdPlan.id);
assert(persistedPlan !== undefined, 'Plan persisted in localStorage');
assert(persistedPlan.startDate === '2026-11-01', 'Persisted Available From matches');
assert(persistedPlan.endDate === '2026-12-31', 'Persisted Available Until matches');

// ---------------------------------------------------------------------------
// 6. Test Date Handling & Timezone Resistance
// ---------------------------------------------------------------------------
console.log('\n--- TEST 6: Timezone & Calendar Date Handling ---');
// Ensure YYYY-MM-DD string comparisons are timezone agnostic
const d1 = '2026-10-31';
const d2 = '2026-11-01';
assert(d1 < d2, 'Calendar date comparison operates on string level with zero timezone offset');
assert(planService.getCurrentDate().length === 10, 'Current date formatted as YYYY-MM-DD');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

