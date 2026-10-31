/**
 * Invoices Mock Service Layer
 * Supports individual & batch invoice generation from active subscriptions,
 * duplicate invoice prevention, dynamic tax and discount calculations,
 * status lifecycle management, and payment reconciliation.
 */

import { planService } from './planService.js';
import { subscriptionService } from './subscriptionService.js';
import { customerService } from './customerService.js';
import { discountService } from './discountService.js';

const STORAGE_KEY = 'brightloop_invoices_data';

export const INVOICE_STATUSES = [
  'Draft',
  'Confirmed',
  'Partially Paid',
  'Paid',
  'Overdue',
  'Cancelled',
];

const INITIAL_INVOICES = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust_1',
    customer: {
      id: 'cust_1',
      name: 'TechCorp Solutions Pvt Ltd',
      contactPerson: 'Ananya Sharma',
      email: 'ananya@techcorp.io',
      phone: '+91 98201 44521',
      billingAddress: {
        street: 'Tower B, 7th Floor, Mindspace IT Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400064',
        country: 'India',
      },
    },
    subscriptionId: 'sub_1',
    subscriptionNumber: 'SUB-2026-001',
    billingPeriod: {
      startDate: '2026-10-20',
      endDate: '2026-11-19',
    },
    invoiceDate: '2026-10-20',
    dueDate: '2026-11-04',
    items: [
      {
        id: 'item_inv_101',
        productId: 'prod_1',
        productName: 'Odoo Subscription Connector',
        planId: 'plan_1',
        planName: 'Odoo Connector - Monthly Business',
        quantity: 2,
        unitPrice: 4999,
        lineTotal: 9998,
      },
    ],
    subtotal: 9998,
    discountId: null,
    discountCode: null,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 1799.64,
    grandTotal: 11797.64,
    amountPaid: 11797.64,
    balanceDue: 0,
    status: 'Paid',
    notes: 'Recurring monthly invoice for Odoo Subscription Connector deployment.',
    createdAt: '2026-10-20T12:00:00Z',
    updatedAt: '2026-10-21T15:30:00Z',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust_2',
    customer: {
      id: 'cust_2',
      name: 'Nexus FinTech Enterprises',
      contactPerson: 'Vikramaditya Roy',
      email: 'vikram.roy@nexusfin.com',
      phone: '+91 91673 88204',
      billingAddress: {
        street: '42 Prestige Tech Cloud, Outer Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India',
      },
    },
    subscriptionId: 'sub_2',
    subscriptionNumber: 'SUB-2026-002',
    billingPeriod: {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    },
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-15',
    items: [
      {
        id: 'item_inv_201',
        productId: 'prod_2',
        productName: 'Cloud Infrastructure Monitoring Daemon',
        planId: 'plan_3',
        planName: 'Cloud Daemon - Growth Tier',
        quantity: 4,
        unitPrice: 3499,
        lineTotal: 13996,
      },
    ],
    subtotal: 13996,
    discountId: 'disc_1',
    discountCode: 'FESTIVE15',
    discountAmount: 2099.4,
    taxRate: 18,
    taxAmount: 2141.39,
    grandTotal: 14037.99,
    amountPaid: 6000,
    balanceDue: 8037.99,
    status: 'Partially Paid',
    notes: 'Initial monthly monitoring retainer under Festive concession.',
    createdAt: '2026-09-01T09:30:00Z',
    updatedAt: '2026-09-10T14:00:00Z',
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust_5',
    customer: {
      id: 'cust_5',
      name: 'Alpha Freight & Logistics',
      contactPerson: 'Suresh Patel',
      email: 'suresh@alphalogistics.in',
      phone: '+91 98790 12045',
      billingAddress: {
        street: 'Near Logistics Hub, SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380054',
        country: 'India',
      },
    },
    subscriptionId: 'sub_3',
    subscriptionNumber: 'SUB-2026-003',
    billingPeriod: {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    },
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-15',
    items: [
      {
        id: 'item_inv_301',
        productId: 'prod_4',
        productName: 'Smart POS Terminal V2',
        planId: 'plan_5',
        planName: 'POS Terminal - Hardware Lease Monthly',
        quantity: 10,
        unitPrice: 1899,
        lineTotal: 18990,
      },
    ],
    subtotal: 18990,
    discountId: null,
    discountCode: null,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 3418.2,
    grandTotal: 22408.2,
    amountPaid: 0,
    balanceDue: 22408.2,
    status: 'Overdue',
    notes: 'August terminal hardware lease invoice overdue.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-16T00:00:00Z',
  },
  {
    id: 'inv_alice_1',
    invoiceNumber: 'INV-ALICE-001',
    customerId: 'CUST001',
    customer: {
      id: 'CUST001',
      name: 'Alice',
      email: 'alice@example.com',
      company: 'Alice Enterprises',
    },
    subscriptionId: 'sub_alice_1',
    subscriptionNumber: 'SUB-ALICE-001',
    billingPeriod: {
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    },
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-15',
    items: [
      {
        id: 'item_al_101',
        productId: 'prod_1',
        productName: 'Odoo Subscription Connector',
        planId: 'plan_1',
        planName: 'Odoo Connector - Monthly Business',
        quantity: 1,
        unitPrice: 4999,
        lineTotal: 4999,
      },
    ],
    subtotal: 4999,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 899.82,
    grandTotal: 5898.82,
    amountPaid: 5898.82,
    balanceDue: 0,
    status: 'Paid',
    notes: 'Paid in full via Bank Wire.',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'inv_alice_2',
    invoiceNumber: 'INV-ALICE-002',
    customerId: 'CUST001',
    customer: {
      id: 'CUST001',
      name: 'Alice',
      email: 'alice@example.com',
      company: 'Alice Enterprises',
    },
    subscriptionId: 'sub_alice_2',
    subscriptionNumber: 'SUB-ALICE-002',
    billingPeriod: {
      startDate: '2026-10-15',
      endDate: '2026-11-14',
    },
    invoiceDate: '2026-10-15',
    dueDate: '2026-11-15',
    items: [
      {
        id: 'item_al_201',
        productId: 'prod_2',
        productName: 'Cloud Infrastructure Monitoring Daemon',
        planId: 'plan_3',
        planName: 'Cloud Daemon - Growth Tier',
        quantity: 1,
        unitPrice: 3499,
        lineTotal: 3499,
      },
    ],
    subtotal: 3499,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 629.82,
    grandTotal: 4128.82,
    amountPaid: 0,
    balanceDue: 4128.82,
    status: 'Confirmed',
    notes: 'Upcoming November cycle invoice.',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'inv_bob_1',
    invoiceNumber: 'INV-BOB-001',
    customerId: 'CUST002',
    customer: {
      id: 'CUST002',
      name: 'Bob',
      email: 'bob@example.com',
      company: 'Bob Retail Logistics',
    },
    subscriptionId: 'sub_bob_1',
    subscriptionNumber: 'SUB-BOB-001',
    billingPeriod: {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    },
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-15',
    items: [
      {
        id: 'item_bob_101',
        productId: 'prod_4',
        productName: 'Smart POS Terminal V2',
        planId: 'plan_5',
        planName: 'POS Terminal - Hardware Lease Monthly',
        quantity: 1,
        unitPrice: 1899,
        lineTotal: 1899,
      },
    ],
    subtotal: 1899,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 341.82,
    grandTotal: 2240.82,
    amountPaid: 2240.82,
    balanceDue: 0,
    status: 'Paid',
    notes: 'September terminal lease settled.',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'inv_bob_2',
    invoiceNumber: 'INV-BOB-002',
    customerId: 'CUST002',
    customer: {
      id: 'CUST002',
      name: 'Bob',
      email: 'bob@example.com',
      company: 'Bob Retail Logistics',
    },
    subscriptionId: 'sub_bob_2',
    subscriptionNumber: 'SUB-BOB-002',
    billingPeriod: {
      startDate: '2026-10-01',
      endDate: '2027-10-01',
    },
    invoiceDate: '2026-10-01',
    dueDate: '2026-11-15',
    items: [
      {
        id: 'item_bob_201',
        productId: 'prod_1',
        productName: 'Odoo Subscription Connector',
        planId: 'plan_2',
        planName: 'Odoo Connector - Enterprise Annual',
        quantity: 1,
        unitPrice: 49999,
        lineTotal: 49999,
      },
    ],
    subtotal: 49999,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 8999.82,
    grandTotal: 58998.82,
    amountPaid: 20000,
    balanceDue: 38998.82,
    status: 'Partially Paid',
    notes: 'Annual license invoice - first tranche received.',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'inv_charlie_1',
    invoiceNumber: 'INV-CHARLIE-001',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      name: 'Charlie',
      email: 'charlie@example.com',
      company: 'Charlie Tech Labs',
    },
    subscriptionId: 'sub_charlie_1',
    subscriptionNumber: 'SUB-CHARLIE-001',
    billingPeriod: {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    },
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-15',
    items: [
      {
        id: 'item_ch_101',
        productId: 'prod_2',
        productName: 'Cloud Infrastructure Monitoring Daemon',
        planId: 'plan_3',
        planName: 'Cloud Daemon - Starter Tier',
        quantity: 1,
        unitPrice: 1999,
        lineTotal: 1999,
      },
    ],
    subtotal: 1999,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 359.82,
    grandTotal: 2358.82,
    amountPaid: 2358.82,
    balanceDue: 0,
    status: 'Paid',
    notes: 'August monitoring settled via UPI.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'inv_charlie_2',
    invoiceNumber: 'INV-CHARLIE-002',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      name: 'Charlie',
      email: 'charlie@example.com',
      company: 'Charlie Tech Labs',
    },
    subscriptionId: 'sub_charlie_2',
    subscriptionNumber: 'SUB-CHARLIE-002',
    billingPeriod: {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    },
    invoiceDate: '2026-08-01',
    dueDate: '2026-09-01',
    items: [
      {
        id: 'item_ch_201',
        productId: 'prod_1',
        productName: 'Odoo Subscription Connector',
        planId: 'plan_2',
        planName: 'Odoo Connector - Enterprise Consulting',
        quantity: 1,
        unitPrice: 15000,
        lineTotal: 15000,
      },
    ],
    subtotal: 15000,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 2700,
    grandTotal: 17700,
    amountPaid: 0,
    balanceDue: 17700,
    status: 'Overdue',
    notes: 'Consulting pilot balance overdue.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z',
  },
];

class InvoiceService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
      }
    } catch {
      // storage fallback
    }
  }

  generateInvoiceNumber() {
    const list = this.getInvoices();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    return `INV-${year}-${pad}`;
  }

  calculateTotals(items = [], discountAmount = 0, taxRate = 18) {
    const subtotal = items.reduce((acc, item) => {
      const line = Number(item.lineTotal) || Number(item.totalPrice) || ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0));
      return acc + line;
    }, 0);
    const validDiscount = Math.min(Math.max(Number(discountAmount) || 0, 0), subtotal);
    const taxableAmount = Math.max(subtotal - validDiscount, 0);
    const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(validDiscount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  getInvoices() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : INITIAL_INVOICES;
      const today = planService.getCurrentDate();

      // Automatically evaluate status: Paid, Partially Paid, Overdue
      return list.map((inv) => {
        let status = inv.status;
        const balanceDue = Math.max(0, Math.round(((inv.grandTotal || 0) - (inv.amountPaid || 0)) * 100) / 100);

        if (status !== 'Cancelled') {
          if (balanceDue <= 0 && (inv.amountPaid || 0) > 0) {
            status = 'Paid';
          } else if ((inv.amountPaid || 0) > 0 && balanceDue > 0) {
            if (inv.dueDate && today > inv.dueDate) {
              status = 'Overdue';
            } else {
              status = 'Partially Paid';
            }
          } else if (inv.dueDate && today > inv.dueDate && balanceDue > 0 && status !== 'Draft') {
            status = 'Overdue';
          }
        }

        return {
          ...inv,
          balanceDue,
          status,
        };
      });
    } catch {
      return INITIAL_INVOICES;
    }
  }

  getInvoiceById(id) {
    const list = this.getInvoices();
    return list.find((i) => i.id === id) || null;
  }

  getInvoicesByCustomer(customerId) {
    if (!customerId) return [];
    const list = this.getInvoices();
    return list.filter((i) => i.customerId === customerId || i.customer?.id === customerId);
  }

  getInvoicesForCustomer(customerId) {
    return this.getInvoicesByCustomer(customerId);
  }

  getInvoiceForCustomer(id, customerId) {
    if (!customerId) throw new Error('Customer ID is required.');
    const inv = this.getInvoiceById(id);
    if (!inv) return null;
    if (inv.customerId !== customerId && inv.customer?.id !== customerId) {
      throw new Error('Access denied: You do not have permission to view this invoice.');
    }
    return inv;
  }

  /* ----------------- SESSION-DERIVED CUSTOMER ACCESS ----------------- */

  getAuthenticatedUser() {
    try {
      const stored = localStorage.getItem('brightloop_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getMyInvoices() {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.getInvoicesByCustomer(customerId);
  }

  getMyInvoiceById(id) {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    const customerId = user.customerId || (user.role === 'customer' ? user.id : 'CUST001');
    return this.getInvoiceForCustomer(id, customerId);
  }

  createInvoice(data) {
    const list = this.getInvoices();
    const invNumber = data.invoiceNumber || this.generateInvoiceNumber();
    const rawItems = data.items || [];
    const items = rawItems.map((item, idx) => ({
      id: item.id || `item_${Date.now()}_${idx}`,
      productId: item.productId || null,
      productName: item.productName || 'Service Item',
      planId: item.planId || null,
      planName: item.planName || null,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      lineTotal: Number(item.lineTotal) || Number(item.totalPrice) || ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)),
    }));
    const taxRate = data.taxRate !== undefined ? Number(data.taxRate) : 18;

    const totals = this.calculateTotals(items, data.discountAmount || 0, taxRate);
    const amountPaid = Number(data.amountPaid) || 0;
    const balanceDue = Math.max(0, Math.round((totals.grandTotal - amountPaid) * 100) / 100);

    let initialStatus = data.status || 'Confirmed';
    if (initialStatus !== 'Cancelled' && initialStatus !== 'Draft') {
      if (balanceDue <= 0 && amountPaid > 0) {
        initialStatus = 'Paid';
      } else if (amountPaid > 0 && balanceDue > 0) {
        initialStatus = 'Partially Paid';
      }
    }

    const customer = data.customer || (data.customerId ? customerService.getCustomerById(data.customerId) : null);
    const customerId = data.customerId || customer?.id || null;

    const billingPeriod = data.billingPeriod || {
      startDate: data.periodStart || data.invoiceDate || planService.getCurrentDate(),
      endDate: data.periodEnd || data.dueDate || planService.getCurrentDate(),
    };

    const newInvoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      invoiceNumber: invNumber,
      customerId,
      customer,
      subscriptionId: data.subscriptionId || null,
      subscriptionNumber: data.subscriptionNumber || null,
      billingPeriod,
      periodStart: billingPeriod.startDate,
      periodEnd: billingPeriod.endDate,
      invoiceDate: data.invoiceDate || planService.getCurrentDate(),
      dueDate: data.dueDate || planService.getCurrentDate(),
      items,
      subtotal: totals.subtotal,
      discountId: data.discountId || null,
      discountCode: data.discountCode || null,
      discountAmount: totals.discountAmount,
      taxRate,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      amountPaid,
      balanceDue,
      status: initialStatus,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newInvoice, ...list];
    this.saveInvoices(updated);

    // If discount used, record usage
    if (data.discountId) {
      try {
        discountService.recordDiscountUsage(data.discountId);
      } catch {}
    }

    return newInvoice;
  }

  updateInvoice(id, data = {}) {
    const user = this.getAuthenticatedUser();
    if (user && user.role === 'customer' && !data._allowInternal) {
      throw new Error('Access denied: Customers cannot edit or modify invoices.');
    }

    const list = this.getInvoices();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = list[index];
    if (current.status === 'Confirmed' && !data._allowInternal) {
      throw new Error('Cannot edit a confirmed invoice.');
    }

    const items = data.items || current.items;
    const totals = this.calculateTotals(items, data.discountAmount ?? current.discountAmount, data.taxRate ?? current.taxRate);
    const amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : (current.amountPaid || 0);
    const balanceDue = Math.max(0, Math.round((totals.grandTotal - amountPaid) * 100) / 100);

    list[index] = {
      ...current,
      ...data,
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      amountPaid,
      balanceDue,
      updatedAt: new Date().toISOString(),
    };

    this.saveInvoices(list);
    return list[index];
  }

  confirmInvoice(id) {
    const inv = this.getInvoiceById(id);
    if (!inv) throw new Error('Invoice not found.');
    if (inv.status !== 'Draft') {
      throw new Error(`Only draft invoices can be confirmed (currently ${inv.status}).`);
    }

    return this.updateInvoice(id, {
      status: 'Confirmed',
      _allowInternal: true,
    });
  }

  cancelInvoice(id) {
    const inv = this.getInvoiceById(id);
    if (!inv) throw new Error('Invoice not found.');
    if (inv.status === 'Paid') {
      throw new Error('Cannot cancel a paid invoice.');
    }

    return this.updateInvoice(id, {
      status: 'Cancelled',
      _allowInternal: true,
    });
  }

  deleteInvoice(id) {
    const user = this.getAuthenticatedUser();
    if (user && user.role === 'customer') {
      throw new Error('Access denied: Customers cannot delete invoices.');
    }
    const list = this.getInvoices();
    const filtered = list.filter((i) => i.id !== id);
    this.saveInvoices(filtered);
    return true;
  }

  recordPaymentOnInvoice(invoiceId, paymentAmount) {
    const inv = this.getInvoiceById(invoiceId);
    if (!inv) throw new Error('Invoice not found.');
    if (inv.status === 'Cancelled') {
      throw new Error('Cannot record payment on a cancelled invoice.');
    }

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (amount > inv.balanceDue) {
      throw new Error(`Payment amount ₹${amount.toLocaleString('en-IN')} exceeds remaining balance of ₹${inv.balanceDue.toLocaleString('en-IN')}.`);
    }

    const newAmountPaid = Math.round(((inv.amountPaid || 0) + amount) * 100) / 100;
    const newBalanceDue = Math.max(0, Math.round((inv.grandTotal - newAmountPaid) * 100) / 100);
    const newStatus = newBalanceDue <= 0 ? 'Paid' : 'Partially Paid';

    return this.updateInvoice(invoiceId, {
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
      _allowInternal: true,
    });
  }

  /**
   * Helper: Calculate billing period for a subscription based on its billing frequency
   */
  calculateBillingPeriod(subscription, targetDateStr) {
    const baseDateStr = targetDateStr || subscription.nextInvoiceDate || subscription.startDate;
    const frequency = subscription.billingFrequency || 'Monthly';
    const endDateStr = subscriptionService.calculateEndDate(baseDateStr, frequency);

    return {
      startDate: baseDateStr,
      endDate: endDateStr,
    };
  }

  /**
   * Check for duplicate invoice:
   * Rule: Never generate duplicate invoices for the same subscription and billing period!
   */
  hasExistingInvoiceForPeriod(subscriptionId, periodStartDate, periodEndDate) {
    const existing = this.getInvoices();
    return existing.some(
      (inv) =>
        inv.subscriptionId === subscriptionId &&
        inv.status !== 'Cancelled' &&
        inv.billingPeriod &&
        inv.billingPeriod.startDate === periodStartDate &&
        inv.billingPeriod.endDate === periodEndDate
    );
  }

  /**
   * Generate invoice from a single active subscription
   */
  generateFromSubscription(subscriptionId, options = {}) {
    const sub = subscriptionService.getSubscriptionById(subscriptionId);
    if (!sub) throw new Error('Subscription not found.');

    if (sub.status !== 'Active') {
      throw new Error(`Cannot generate invoice for subscription in status "${sub.status}". Only Active subscriptions are eligible.`);
    }

    const today = options.billingDate || options.invoiceDate || planService.getCurrentDate();
    const period = options.billingPeriod || (options.periodStart && options.periodEnd ? { startDate: options.periodStart, endDate: options.periodEnd } : this.calculateBillingPeriod(sub, today));

    // Duplicate check
    if (this.hasExistingInvoiceForPeriod(sub.id, period.startDate, period.endDate)) {
      throw new Error(`An invoice already exists and has already been generated for ${sub.subscriptionNumber} for billing period ${period.startDate} to ${period.endDate}.`);
    }

    // Determine due date (e.g. 15 days from invoice date)
    let dueDate = options.dueDate;
    if (!dueDate) {
      const [y, m, d] = today.split('-').map(Number);
      const dueDateObj = new Date(Date.UTC(y, m - 1, d + 15));
      dueDate = dueDateObj.toISOString().split('T')[0];
    }

    const lineItem = {
      id: `item_${Date.now()}`,
      productId: sub.productId,
      productName: sub.productName,
      planId: sub.planId,
      planName: sub.planName,
      quantity: sub.quantity || 1,
      unitPrice: sub.unitPrice || 0,
      lineTotal: (sub.quantity || 1) * (sub.unitPrice || 0),
    };

    // Evaluate discount if provided or auto-check
    let discountAmount = 0;
    let appliedDiscountId = options.discountId || null;
    let appliedDiscountCode = options.discountCode || null;

    if (appliedDiscountId || appliedDiscountCode) {
      const discEval = discountService.evaluateDiscount({
        discountId: appliedDiscountId,
        discountCode: appliedDiscountCode,
        subtotal: lineItem.lineTotal,
        quantity: lineItem.quantity,
        productId: sub.productId,
        subscriptionId: sub.id,
        currentDate: today,
      });

      if (discEval.eligible || discEval.valid) {
        discountAmount = discEval.discountAmount;
        appliedDiscountId = discEval.discount.id;
        appliedDiscountCode = discEval.discount.code;
      }
    }

    const customer = sub.customer || (sub.customerId ? customerService.getCustomerById(sub.customerId) : null);
    const customerId = sub.customerId || customer?.id;

    return this.createInvoice({
      customerId,
      customer,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      billingPeriod: period,
      invoiceDate: today,
      dueDate,
      items: [lineItem],
      discountId: appliedDiscountId,
      discountCode: appliedDiscountCode,
      discountAmount,
      taxRate: options.taxRate !== undefined ? options.taxRate : 18,
      status: options.status || 'Confirmed',
      notes: options.notes || `Recurring billing for ${sub.billingFrequency} plan: ${sub.planName}.`,
    });
  }

  /**
   * Batch Invoice Generation
   * Generates invoices in bulk for selected or all eligible subscriptions.
   * Returns a detailed summary of generated, skipped, and failed records with reasons.
   */
  generateBatchInvoices({ billingDate, invoiceDate, subscriptionIds = null, discountCode = null }) {
    const today = billingDate || invoiceDate || planService.getCurrentDate();
    const allSubs = subscriptionService.getSubscriptions();

    const candidates = subscriptionIds
      ? allSubs.filter((s) => subscriptionIds.includes(s.id))
      : allSubs;

    const summary = {
      generated: [],
      skipped: [],
      failed: [],
      totalEvaluated: candidates.length,
    };

    for (const sub of candidates) {
      // 1. Check status: Only Active subscriptions can be invoiced
      if (sub.status !== 'Active') {
        summary.skipped.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer?.name,
          reason: `Subscription is ${sub.status} (only Active subscriptions are eligible)`,
        });
        continue;
      }

      // 2. Calculate billing period
      const period = this.calculateBillingPeriod(sub, today);

      // 3. Check for duplicates
      if (this.hasExistingInvoiceForPeriod(sub.id, period.startDate, period.endDate)) {
        summary.skipped.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer?.name,
          reason: `Duplicate: already invoiced for period ${period.startDate} to ${period.endDate}`,
        });
        continue;
      }

      // 4. Attempt generation
      try {
        const inv = this.generateFromSubscription(sub.id, {
          billingDate: today,
          billingPeriod: period,
          discountCode,
        });

        summary.generated.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer?.name,
          grandTotal: inv.grandTotal,
        });
      } catch (err) {
        summary.failed.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer?.name,
          reason: err.message,
        });
      }
    }

    summary.generatedCount = summary.generated.length;
    summary.skippedCount = summary.skipped.length;
    summary.failedCount = summary.failed.length;

    return summary;
  }

  saveInvoices(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage fallback
    }
  }
}

export const invoiceService = new InvoiceService();
