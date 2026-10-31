import { session } from './session.js';
/**
 * Subscriptions Mock Service Layer
 * Supports lifecycle states (Draft, Quotation, Confirmed, Active, Paused, Closed),
 * activity history timelines, renewal calculations, and automatic closure.
 */

import { quotationService } from './quotationService.js';
import { planService } from './planService.js';

const STORAGE_KEY = 'brightloop_subscriptions_data';

export const SUBSCRIPTION_STATUSES = [
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Paused',
  'Closed',
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'sub_1',
    subscriptionNumber: 'SUB-2026-001',
    quotationId: 'quot_1',
    quotationNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customer: {
      id: 'cust_1',
      name: 'TechCorp Solutions Pvt Ltd',
      contactPerson: 'Ananya Sharma',
      email: 'ananya@techcorp.io',
      phone: '+91 98201 44521',
      company: 'TechCorp Solutions',
      billingAddress: {
        street: 'Tower B, 7th Floor, Mindspace IT Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400064',
        country: 'India',
      },
    },
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_1',
    planName: 'Odoo Connector - Monthly Business',
    quantity: 2,
    unitPrice: 4999,
    totalPrice: 9998,
    billingFrequency: 'Monthly',
    startDate: '2026-10-20',
    endDate: '2027-10-19',
    nextInvoiceDate: '2026-11-20',
    status: 'Active',
    notes: 'Converted from Quotation QT-2026-001. Production sync deployed.',
    lifecyclePolicy: {
      allowPause: true,
      allowEarlyClosure: true,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
    activityHistory: [
      {
        id: 'act_101',
        event: 'Created',
        title: 'Subscription Generated',
        description: 'Generated from confirmed commercial quotation QT-2026-001.',
        timestamp: '2026-10-20T11:30:00Z',
        user: 'System Admin',
      },
      {
        id: 'act_102',
        event: 'Confirmed',
        title: 'Terms Confirmed',
        description: 'Customer accepted contractual terms and signed master service agreement.',
        timestamp: '2026-10-20T11:45:00Z',
        user: 'Ananya Sharma (TechCorp)',
      },
      {
        id: 'act_103',
        event: 'Activated',
        title: 'Service Activated',
        description: 'Connector instances provisioned and recurring monthly billing initiated.',
        timestamp: '2026-10-20T12:00:00Z',
        user: 'Ops Engine',
      },
    ],
    createdAt: '2026-10-20T11:30:00Z',
    updatedAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'sub_2',
    subscriptionNumber: 'SUB-2026-002',
    quotationId: null,
    quotationNumber: null,
    customerId: 'cust_2',
    customer: {
      id: 'cust_2',
      name: 'Nexus FinTech Enterprises',
      contactPerson: 'Vikramaditya Roy',
      email: 'vikram.roy@nexusfin.com',
      phone: '+91 91673 88204',
      company: 'Nexus FinTech',
      billingAddress: {
        street: '42 Prestige Tech Cloud, Outer Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India',
      },
    },
    productId: 'prod_2',
    productName: 'Cloud Infrastructure Monitoring Daemon',
    planId: 'plan_3',
    planName: 'Cloud Daemon - Growth Tier',
    quantity: 4,
    unitPrice: 3499,
    totalPrice: 13996,
    billingFrequency: 'Monthly',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    nextInvoiceDate: '2026-11-01',
    status: 'Paused',
    notes: 'Temporarily paused at customer request during internal datacenter cloud migration.',
    lifecyclePolicy: {
      allowPause: true,
      allowEarlyClosure: true,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
    activityHistory: [
      {
        id: 'act_201',
        event: 'Created',
        title: 'Subscription Created',
        description: 'Direct subscription created for 4 cloud monitoring daemons.',
        timestamp: '2026-09-01T09:00:00Z',
        user: 'Sales Desk',
      },
      {
        id: 'act_202',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Monitoring nodes registered and health checks operational.',
        timestamp: '2026-09-01T09:15:00Z',
        user: 'System Admin',
      },
      {
        id: 'act_203',
        event: 'Paused',
        title: 'Subscription Paused',
        description: 'Paused for 15 days due to customer server migration.',
        timestamp: '2026-10-25T15:00:00Z',
        user: 'Vikramaditya Roy',
      },
    ],
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-10-25T15:00:00Z',
  },
  {
    id: 'sub_3',
    subscriptionNumber: 'SUB-2026-003',
    quotationId: null,
    quotationNumber: null,
    customerId: 'cust_5',
    customer: {
      id: 'cust_5',
      name: 'Alpha Freight & Logistics',
      contactPerson: 'Suresh Patel',
      email: 'suresh@alphalogistics.in',
      phone: '+91 98790 12045',
      company: 'Alpha Freight Systems',
      billingAddress: {
        street: 'Near Logistics Hub, SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380054',
        country: 'India',
      },
    },
    productId: 'prod_4',
    productName: 'Smart POS Terminal V2',
    planId: 'plan_5',
    planName: 'POS Terminal - Hardware Lease Monthly',
    quantity: 10,
    unitPrice: 1899,
    totalPrice: 18990,
    billingFrequency: 'Monthly',
    startDate: '2026-08-01',
    endDate: '2026-10-01', // Ended in the past
    nextInvoiceDate: '2026-10-01',
    status: 'Closed',
    notes: 'Seasonal freight pop-up lease ended as planned.',
    lifecyclePolicy: {
      allowPause: false,
      allowEarlyClosure: true,
      renewalMode: 'manual',
      renewalEnabled: false,
    },
    activityHistory: [
      {
        id: 'act_301',
        event: 'Created',
        title: 'Subscription Created',
        description: 'Direct POS hardware lease for seasonal logistics hub.',
        timestamp: '2026-08-01T08:30:00Z',
        user: 'Support Team',
      },
      {
        id: 'act_302',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Hardware delivered and terminal credentials dispatched.',
        timestamp: '2026-08-01T10:00:00Z',
        user: 'System Admin',
      },
      {
        id: 'act_303',
        event: 'Closed',
        title: 'Automatic Closure',
        description: 'Subscription reached its scheduled expiration date and was closed automatically.',
        timestamp: '2026-10-01T23:59:59Z',
        user: 'Lifecycle Scheduler',
      },
    ],
    createdAt: '2026-08-01T08:30:00Z',
    updatedAt: '2026-10-01T23:59:59Z',
  },
  {
    id: 'sub_4',
    subscriptionNumber: 'SUB-2026-004',
    quotationId: null,
    quotationNumber: null,
    customerId: 'cust_3',
    customer: {
      id: 'cust_3',
      name: 'OmniRetail Hypermarkets India',
      contactPerson: 'Kavita Menon',
      email: 'kavita@omniretail.in',
      phone: '+91 98450 33219',
      company: 'OmniRetail Hypermarkets',
      billingAddress: {
        street: 'Commercial Complex 14, Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560025',
        country: 'India',
      },
    },
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_2',
    planName: 'Odoo Connector - Enterprise Annual',
    quantity: 1,
    unitPrice: 49999,
    totalPrice: 49999,
    billingFrequency: 'Yearly',
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    nextInvoiceDate: '2027-10-01',
    status: 'Active',
    notes: 'Enterprise annual retail synchronization instance.',
    lifecyclePolicy: {
      allowPause: true,
      allowEarlyClosure: true,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
    activityHistory: [
      {
        id: 'act_401',
        event: 'Created',
        title: 'Subscription Provisioned',
        description: 'Provisioned for enterprise retail connector cluster.',
        timestamp: '2026-10-01T10:00:00Z',
        user: 'Sales Desk',
      },
      {
        id: 'act_402',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Annual enterprise license activated with dedicated gateway.',
        timestamp: '2026-10-01T11:00:00Z',
        user: 'Ops Engine',
      },
    ],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'sub_alice_1',
    subscriptionNumber: 'SUB-ALICE-001',
    customerId: 'CUST001',
    customer: {
      id: 'CUST001',
      name: 'Alice',
      email: 'alice@example.com',
      company: 'Alice Enterprises',
    },
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_1',
    planName: 'Odoo Connector - Monthly Business',
    quantity: 1,
    unitPrice: 4999,
    totalPrice: 4999,
    billingFrequency: 'Monthly',
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    nextInvoiceDate: '2026-11-01',
    status: 'Active',
    activityHistory: [
      {
        id: 'act_al_1',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Connector instance provisioned for Alice Enterprises.',
        timestamp: '2026-10-01T09:00:00Z',
        user: 'Operations Team',
      },
    ],
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'sub_alice_2',
    subscriptionNumber: 'SUB-ALICE-002',
    customerId: 'CUST001',
    customer: {
      id: 'CUST001',
      name: 'Alice',
      email: 'alice@example.com',
      company: 'Alice Enterprises',
    },
    productId: 'prod_2',
    productName: 'Cloud Infrastructure Monitoring Daemon',
    planId: 'plan_3',
    planName: 'Cloud Daemon - Growth Tier',
    quantity: 1,
    unitPrice: 3499,
    totalPrice: 3499,
    billingFrequency: 'Monthly',
    startDate: '2026-10-15',
    endDate: '2027-10-15',
    nextInvoiceDate: '2026-11-15',
    status: 'Paused',
    activityHistory: [
      {
        id: 'act_al_2',
        event: 'Paused',
        title: 'Subscription Paused',
        description: 'Customer temporary pause during setup.',
        timestamp: '2026-10-20T10:00:00Z',
        user: 'Operations Team',
      },
    ],
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sub_bob_1',
    subscriptionNumber: 'SUB-BOB-001',
    customerId: 'CUST002',
    customer: {
      id: 'CUST002',
      name: 'Bob',
      email: 'bob@example.com',
      company: 'Bob Retail Logistics',
    },
    productId: 'prod_4',
    productName: 'Smart POS Terminal V2',
    planId: 'plan_5',
    planName: 'POS Terminal - Hardware Lease Monthly',
    quantity: 1,
    unitPrice: 1899,
    totalPrice: 1899,
    billingFrequency: 'Monthly',
    startDate: '2026-09-01',
    endDate: '2027-09-01',
    nextInvoiceDate: '2026-11-01',
    status: 'Active',
    activityHistory: [
      {
        id: 'act_bob_1',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'POS terminal leased to Bob Retail Logistics.',
        timestamp: '2026-09-01T10:00:00Z',
        user: 'System Admin',
      },
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'sub_bob_2',
    subscriptionNumber: 'SUB-BOB-002',
    customerId: 'CUST002',
    customer: {
      id: 'CUST002',
      name: 'Bob',
      email: 'bob@example.com',
      company: 'Bob Retail Logistics',
    },
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_2',
    planName: 'Odoo Connector - Enterprise Annual',
    quantity: 1,
    unitPrice: 49999,
    totalPrice: 49999,
    billingFrequency: 'Yearly',
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    nextInvoiceDate: '2027-10-01',
    status: 'Active',
    activityHistory: [
      {
        id: 'act_bob_2',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Enterprise connector activated for Bob Retail Logistics.',
        timestamp: '2026-10-01T11:00:00Z',
        user: 'Ops Engine',
      },
    ],
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'sub_charlie_1',
    subscriptionNumber: 'SUB-CHARLIE-001',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      name: 'Charlie',
      email: 'charlie@example.com',
      company: 'Charlie Tech Labs',
    },
    productId: 'prod_2',
    productName: 'Cloud Infrastructure Monitoring Daemon',
    planId: 'plan_3',
    planName: 'Cloud Daemon - Starter Tier',
    quantity: 1,
    unitPrice: 1999,
    totalPrice: 1999,
    billingFrequency: 'Monthly',
    startDate: '2026-08-01',
    endDate: '2027-08-01',
    nextInvoiceDate: '2026-11-01',
    status: 'Active',
    activityHistory: [
      {
        id: 'act_ch_1',
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Monitoring cluster online for Charlie Tech Labs.',
        timestamp: '2026-08-01T10:00:00Z',
        user: 'Ops Engine',
      },
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'sub_charlie_2',
    subscriptionNumber: 'SUB-CHARLIE-002',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      name: 'Charlie',
      email: 'charlie@example.com',
      company: 'Charlie Tech Labs',
    },
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    planId: 'plan_2',
    planName: 'Odoo Connector - Enterprise Consulting',
    quantity: 1,
    unitPrice: 15000,
    totalPrice: 15000,
    billingFrequency: 'Monthly',
    startDate: '2026-06-01',
    endDate: '2026-09-01',
    nextInvoiceDate: null,
    status: 'Closed',
    activityHistory: [
      {
        id: 'act_ch_2',
        event: 'Closed',
        title: 'Subscription Closed',
        description: 'Consulting pilot concluded as agreed.',
        timestamp: '2026-09-01T23:59:59Z',
        user: 'System Admin',
      },
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-09-01T23:59:59Z',
  },
];

function addDaysSafe(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function addMonthsSafe(dateStr, monthsToAdd) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const totalMonths = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonth = (((totalMonths % 12) + 12) % 12) + 1;
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}

class SubscriptionService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      }
    } catch {
      // Storage fallback
    }
  }

  calculateEndDate(startDateStr, frequency) {
    if (!startDateStr) return '';
    switch (frequency) {
      case 'Daily':
        return addDaysSafe(startDateStr, 30);
      case 'Weekly':
        return addDaysSafe(startDateStr, 7 * 12);
      case 'Monthly':
        return addMonthsSafe(startDateStr, 12);
      case 'Yearly':
        return addMonthsSafe(startDateStr, 12);
      default:
        return addMonthsSafe(startDateStr, 12);
    }
  }

  calculateNextInvoiceDate(startDateStr, frequency) {
    if (!startDateStr) return '';
    switch (frequency) {
      case 'Daily':
        return addDaysSafe(startDateStr, 1);
      case 'Weekly':
        return addDaysSafe(startDateStr, 7);
      case 'Monthly':
        return addMonthsSafe(startDateStr, 1);
      case 'Yearly':
        return addMonthsSafe(startDateStr, 12);
      default:
        return addMonthsSafe(startDateStr, 1);
    }
  }

  /**
   * Automatic closure: If subscription reaches its end date,
   * update status to Closed when application loads or data refreshes.
   */
  checkAndApplyAutoClosure(subscriptionsList) {
    const today = planService.getCurrentDate();
    let hasChanges = false;

    const updated = subscriptionsList.map((sub) => {
      if (
        (sub.status === 'Active' || sub.status === 'Paused') &&
        sub.endDate &&
        sub.endDate < today
      ) {
        hasChanges = true;
        const autoClosureEvent = {
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          event: 'Closed',
          title: 'Automatic Closure',
          description: `Subscription reached its scheduled end date (${sub.endDate}) and was closed automatically by the system.`,
          timestamp: new Date().toISOString(),
          user: 'Lifecycle Scheduler',
        };
        return {
          ...sub,
          status: 'Closed',
          activityHistory: [autoClosureEvent, ...(sub.activityHistory || [])],
          updatedAt: new Date().toISOString(),
        };
      }
      return sub;
    });

    if (hasChanges) {
      this.saveSubscriptions(updated);
    }
    return updated;
  }

  getSubscriptions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : INITIAL_SUBSCRIPTIONS;
      return this.checkAndApplyAutoClosure(list);
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  }

  getSubscriptionById(id) {
    const list = this.getSubscriptions();
    return list.find((s) => s.id === id) || null;
  }

  generateSubscriptionNumber() {
    const list = this.getSubscriptions();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    return `SUB-${year}-${pad}`;
  }

  createSubscription(data) {
    if (data.quotationId) {
      const quote = quotationService.getQuotationById(data.quotationId);
      if (quote && quote.status !== 'Confirmed') {
        throw new Error(`Cannot create subscription from an unconfirmed quotation (${quote.quotationNumber} is in status "${quote.status}").`);
      }
    }

    const list = this.getSubscriptions();
    const subNumber = data.subscriptionNumber || this.generateSubscriptionNumber();
    const quantity = Number(data.quantity) || 1;
    const unitPrice = Number(data.unitPrice) || 0;
    const totalPrice = quantity * unitPrice;
    const startDate = data.startDate || planService.getCurrentDate();
    const frequency = data.billingFrequency || 'Monthly';
    const endDate = data.endDate || this.calculateEndDate(startDate, frequency);
    const nextInvoiceDate =
      data.nextInvoiceDate || this.calculateNextInvoiceDate(startDate, frequency);

    const initialStatus = data.status || 'Confirmed';

    const creationEvent = {
      id: `act_${Date.now()}`,
      event: 'Created',
      title: 'Subscription Created',
      description: data.quotationId
        ? `Created from confirmed quotation ${data.quotationNumber || ''}.`
        : 'Direct subscription initiated.',
      timestamp: new Date().toISOString(),
      user: 'Operations Team',
    };

    const newSub = {
      id: `sub_${Date.now()}`,
      subscriptionNumber: subNumber,
      quotationId: data.quotationId || null,
      quotationNumber: data.quotationNumber || null,
      customer: data.customer,
      productId: data.productId,
      productName: data.productName,
      planId: data.planId,
      planName: data.planName,
      quantity,
      unitPrice,
      totalPrice,
      billingFrequency: frequency,
      startDate,
      endDate,
      nextInvoiceDate,
      status: initialStatus,
      notes: data.notes || '',
      lifecyclePolicy: data.lifecyclePolicy || {
        allowPause: true,
        allowEarlyClosure: true,
        renewalMode: 'auto',
        renewalEnabled: true,
      },
      activityHistory: [creationEvent],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If initial status is confirmed or active, add appropriate event
    if (initialStatus === 'Active') {
      newSub.activityHistory.unshift({
        id: `act_${Date.now() + 1}`,
        event: 'Activated',
        title: 'Subscription Activated',
        description: 'Service provisioned and activated.',
        timestamp: new Date().toISOString(),
        user: 'Operations Team',
      });
    }

    const updated = [newSub, ...list];
    this.saveSubscriptions(updated);

    // If created from quotation, mark quotation as linked
    if (data.quotationId) {
      try {
        quotationService.linkSubscription(data.quotationId, newSub.id);
      } catch {
        // ignore
      }
    }

    return newSub;
  }

  createFromQuotation(quotationId, overrides = {}) {
    const quote = quotationService.getQuotationById(quotationId);
    if (!quote) throw new Error('Quotation not found.');
    if (quote.status !== 'Confirmed') {
      throw new Error(`Cannot create subscription from an unconfirmed quotation (${quote.quotationNumber} is in status "${quote.status}").`);
    }

    const primaryItem = quote.lineItems?.[0] || {};

    const subData = {
      quotationId: quote.id,
      quotationNumber: quote.quotationNumber,
      customer: quote.customer,
      productId: primaryItem.productId || '',
      productName: primaryItem.productName || 'Subscription Package',
      planId: primaryItem.planId || '',
      planName: primaryItem.planName || 'Custom Enterprise Plan',
      quantity: primaryItem.quantity || 1,
      unitPrice: primaryItem.unitPrice || quote.grandTotal,
      billingFrequency: primaryItem.billingFrequency || 'Monthly',
      startDate: planService.getCurrentDate(),
      status: 'Confirmed',
      notes: `Converted from Quotation ${quote.quotationNumber}. Notes: ${quote.notes || 'None'}`,
      ...overrides,
    };

    return this.createSubscription(subData);
  }

  updateSubscription(id, data) {
    const list = this.getSubscriptions();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveSubscriptions(list);
    return list[index];
  }

  deleteSubscription(id) {
    const list = this.getSubscriptions();
    const target = list.find((s) => s.id === id);
    if (target && (target.status === 'Active' || target.status === 'Confirmed')) {
      throw new Error(`Cannot delete a ${target.status} subscription. You must close it first.`);
    }
    const filtered = list.filter((s) => s.id !== id);
    this.saveSubscriptions(filtered);
    return true;
  }

  /* ----------------- LIFECYCLE ACTIONS ----------------- */

  confirmSubscription(id) {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Draft' && sub.status !== 'Quotation') {
      throw new Error(`Invalid transition: Cannot confirm subscription in status "${sub.status}".`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Confirmed',
      title: 'Subscription Confirmed',
      description: 'Subscription terms agreed and confirmed for activation.',
      timestamp: new Date().toISOString(),
      user: 'Operations Team',
    };

    return this.updateSubscription(id, {
      status: 'Confirmed',
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  activateSubscription(id) {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Confirmed') {
      throw new Error(`Invalid transition: Only confirmed subscriptions can be activated (currently "${sub.status}").`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Activated',
      title: 'Subscription Activated',
      description: 'Service provisioned, active billing cycle began.',
      timestamp: new Date().toISOString(),
      user: 'Operations Team',
    };

    return this.updateSubscription(id, {
      status: 'Active',
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  pauseSubscription(id, reason = 'Customer requested temporary hold') {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Active') {
      throw new Error(`Invalid transition: Only active subscriptions can be paused (currently "${sub.status}").`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Paused',
      title: 'Subscription Paused',
      description: `Billing and service access paused. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      user: 'Operations Team',
    };

    return this.updateSubscription(id, {
      status: 'Paused',
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  resumeSubscription(id) {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Paused') {
      throw new Error(`Invalid transition: Only paused subscriptions can be resumed (currently "${sub.status}").`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Resumed',
      title: 'Subscription Resumed',
      description: 'Service access restored and billing cycle resumed.',
      timestamp: new Date().toISOString(),
      user: 'Operations Team',
    };

    return this.updateSubscription(id, {
      status: 'Active',
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  renewSubscription(id, renewPeriodMonths = 12) {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status === 'Draft' || sub.status === 'Quotation') {
      throw new Error('Draft or Quotation cannot be renewed directly.');
    }

    // Extend endDate from current endDate if in the future, otherwise from current date
    const todayStr = planService.getCurrentDate();
    const baseDate = (sub.endDate && sub.endDate >= todayStr) ? sub.endDate : todayStr;
    const newEndStr = addMonthsSafe(baseDate, renewPeriodMonths);

    const nextInvoiceDate = this.calculateNextInvoiceDate(todayStr, sub.billingFrequency);

    const event = {
      id: `act_${Date.now()}`,
      event: 'Renewed',
      title: 'Subscription Renewed',
      description: `Contract extended by ${renewPeriodMonths} months through ${newEndStr}.`,
      timestamp: new Date().toISOString(),
      user: 'Billing Automation',
    };

    return this.updateSubscription(id, {
      status: 'Active',
      endDate: newEndStr,
      nextInvoiceDate,
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  closeSubscription(id, isEarly = false, reason = 'Contract concluded') {
    const sub = this.getSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status === 'Closed') {
      throw new Error('Subscription is already closed.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const event = {
      id: `act_${Date.now()}`,
      event: 'Closed',
      title: isEarly ? 'Early Closure' : 'Subscription Terminated / Closed',
      description: `${isEarly ? 'Early termination invoked' : 'Manual closure requested'}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      user: 'Authorized Manager',
    };

    return this.updateSubscription(id, {
      status: 'Closed',
      endDate: isEarly ? todayStr : sub.endDate,
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  /* ----------------- CUSTOMER PORTAL DATA & REQUESTS ----------------- */

  getSubscriptionsForCustomer(customerId) {
    if (!customerId) return [];
    const list = this.getSubscriptions();
    return list.filter((s) => s.customerId === customerId || s.customer?.id === customerId);
  }

  getSubscriptionForCustomer(id, customerId) {
    if (!customerId) throw new Error('Customer ID is required.');
    const sub = this.getSubscriptionById(id);
    if (!sub) return null;
    if (sub.customerId !== customerId && sub.customer?.id !== customerId) {
      throw new Error('Access denied: You do not have permission to view this subscription.');
    }
    return sub;
  }

  requestPause(id, customerId, reason = 'Customer requested temporary hold') {
    const sub = this.getSubscriptionForCustomer(id, customerId);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Active') {
      throw new Error(`Cannot request pause: Subscription is currently ${sub.status}.`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Request',
      title: 'Pause Requested',
      description: `Customer submitted hold request: "${reason}" (Pending Admin Approval).`,
      timestamp: new Date().toISOString(),
      user: sub.customer?.contactPerson || 'Customer',
    };

    return this.updateSubscription(id, {
      pendingRequest: {
        type: 'Pause',
        reason,
        requestedAt: new Date().toISOString(),
        status: 'Pending Approval',
      },
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  requestResume(id, customerId, reason = 'Customer requested service resumption') {
    const sub = this.getSubscriptionForCustomer(id, customerId);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status !== 'Paused') {
      throw new Error(`Cannot request resume: Subscription is currently ${sub.status}.`);
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Request',
      title: 'Resume Requested',
      description: `Customer submitted reactivation request: "${reason}" (Pending Admin Approval).`,
      timestamp: new Date().toISOString(),
      user: sub.customer?.contactPerson || 'Customer',
    };

    return this.updateSubscription(id, {
      pendingRequest: {
        type: 'Resume',
        reason,
        requestedAt: new Date().toISOString(),
        status: 'Pending Approval',
      },
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  requestCancellation(id, customerId, reason = 'Customer requested termination') {
    const sub = this.getSubscriptionForCustomer(id, customerId);
    if (!sub) throw new Error('Subscription not found.');
    if (sub.status === 'Closed') {
      throw new Error('Subscription is already closed.');
    }

    const event = {
      id: `act_${Date.now()}`,
      event: 'Request',
      title: 'Cancellation Requested',
      description: `Customer submitted early cancellation request: "${reason}" (Pending Admin Approval).`,
      timestamp: new Date().toISOString(),
      user: sub.customer?.contactPerson || 'Customer',
    };

    return this.updateSubscription(id, {
      pendingRequest: {
        type: 'Cancellation',
        reason,
        requestedAt: new Date().toISOString(),
        status: 'Pending Approval',
      },
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  cancelPendingRequest(id, customerId) {
    const sub = this.getSubscriptionForCustomer(id, customerId);
    if (!sub) throw new Error('Subscription not found.');

    const event = {
      id: `act_${Date.now()}`,
      event: 'Request',
      title: 'Request Withdrawn',
      description: 'Customer withdrew the pending lifecycle request.',
      timestamp: new Date().toISOString(),
      user: sub.customer?.contactPerson || 'Customer',
    };

    return this.updateSubscription(id, {
      pendingRequest: null,
      activityHistory: [event, ...(sub.activityHistory || [])],
    });
  }

  approvePendingRequest(id, reviewer = 'Admin') {
    const sub = this.getSubscriptionById(id);
    if (!sub || !sub.pendingRequest) throw new Error('No pending request found.');

    const req = sub.pendingRequest;
    if (req.type === 'Pause') {
      this.pauseSubscription(id, `Approved by ${reviewer}: ${req.reason}`);
    } else if (req.type === 'Resume') {
      this.resumeSubscription(id);
    } else if (req.type === 'Cancellation') {
      this.closeSubscription(id, true, `Approved by ${reviewer}: ${req.reason}`);
    }

    return this.updateSubscription(id, {
      pendingRequest: null,
    });
  }

  /* ----------------- SESSION-DERIVED CUSTOMER ACCESS ----------------- */

  getAuthenticatedUser() {
    return session.get();
  }

  getMySubscriptions() {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.getSubscriptionsForCustomer(customerId);
  }

  getMySubscriptionById(id) {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.getSubscriptionForCustomer(id, customerId);
  }

  requestMySubscriptionPause(id, reason = '') {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.requestPause(id, customerId, reason);
  }

  requestMySubscriptionResume(id, reason = '') {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.requestResume(id, customerId, reason);
  }

  requestMySubscriptionCancellation(id, reason = '') {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.requestCancellation(id, customerId, reason);
  }

  cancelMySubscriptionRequest(id) {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.cancelPendingRequest(id, customerId);
  }

  saveSubscriptions(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Fallback
    }
  }
}

export const subscriptionService = new SubscriptionService();

