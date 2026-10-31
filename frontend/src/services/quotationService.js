/**
 * Quotations Mock Service Layer
 * Supports multi-line products/plans, tax/discount calculation, and conversion to subscriptions.
 */

const STORAGE_KEY = 'brightloop_quotations_data';

export const QUOTATION_STATUSES = ['Draft', 'Sent', 'Confirmed', 'Cancelled', 'Expired'];

const VALID_QUOTATION_TRANSITIONS = {
  Draft: ['Sent', 'Confirmed', 'Cancelled'],
  Sent: ['Confirmed', 'Cancelled', 'Expired'],
  Confirmed: ['Cancelled'],
  Cancelled: [],
  Expired: [],
};

const INITIAL_QUOTATIONS = [
  {
    id: 'quot_1',
    quotationNumber: 'QT-2026-001',
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
    quotationDate: '2026-10-18',
    expiryDate: '2026-11-18',
    status: 'Confirmed',
    notes: 'Includes bi-directional Odoo ERP sync and annual growth cloud monitoring package.',
    lineItems: [
      {
        id: 'item_101',
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
        id: 'item_102',
        productId: 'prod_2',
        productName: 'Cloud Infrastructure Monitoring Daemon',
        planId: 'plan_3',
        planName: 'Cloud Daemon - Growth Tier',
        billingFrequency: 'Monthly',
        quantity: 3,
        unitPrice: 3499,
        lineTotal: 10497,
      },
    ],
    subtotal: 20495,
    discountType: 'percentage',
    discountValue: 10,
    discountAmount: 2049.5,
    taxRate: 18,
    taxAmount: 3320.19,
    grandTotal: 21765.69,
    subscriptionId: 'sub_1',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-20T11:30:00Z',
  },
  {
    id: 'quot_2',
    quotationNumber: 'QT-2026-002',
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
    quotationDate: '2026-10-24',
    expiryDate: '2026-11-24',
    status: 'Sent',
    notes: 'Annual Enterprise connector proposal with dedicated Technical Account Manager support.',
    lineItems: [
      {
        id: 'item_201',
        productId: 'prod_1',
        productName: 'Odoo Subscription Connector',
        planId: 'plan_2',
        planName: 'Odoo Connector - Annual Enterprise Suite',
        billingFrequency: 'Yearly',
        quantity: 1,
        unitPrice: 49990,
        lineTotal: 49990,
      },
      {
        id: 'item_202',
        productId: 'prod_3',
        productName: 'Technical Account Manager (TAM) Retainer',
        planId: 'plan_4',
        planName: 'TAM Concierge - Monthly SLA',
        billingFrequency: 'Monthly',
        quantity: 1,
        unitPrice: 12500,
        lineTotal: 12500,
      },
    ],
    subtotal: 62490,
    discountType: 'fixed',
    discountValue: 5000,
    discountAmount: 5000,
    taxRate: 18,
    taxAmount: 10348.2,
    grandTotal: 67838.2,
    subscriptionId: null,
    createdAt: '2026-10-24T14:15:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
  },
  {
    id: 'quot_3',
    quotationNumber: 'QT-2026-003',
    customer: {
      id: 'cust_3',
      name: 'Acme Retail Chain Networks',
      contactPerson: 'Rajesh K. Verma',
      email: 'rajesh.verma@acmeretail.in',
      phone: '+91 98112 34900',
      company: 'Acme Retail Group',
      billingAddress: {
        street: 'Plot 18, Udyog Vihar Phase 4',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122016',
        country: 'India',
      },
    },
    quotationDate: '2026-10-28',
    expiryDate: '2026-11-15',
    status: 'Draft',
    notes: 'Store POS device subscription draft estimation pending commercial discount approval.',
    lineItems: [
      {
        id: 'item_301',
        productId: 'prod_4',
        productName: 'Smart POS Terminal V2',
        planId: 'plan_5',
        planName: 'POS Terminal - Hardware Lease Monthly',
        billingFrequency: 'Monthly',
        quantity: 5,
        unitPrice: 1899,
        lineTotal: 9495,
      },
    ],
    subtotal: 9495,
    discountType: 'percentage',
    discountValue: 5,
    discountAmount: 474.75,
    taxRate: 18,
    taxAmount: 1623.65,
    grandTotal: 10643.9,
    subscriptionId: null,
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 'quot_4',
    quotationNumber: 'QT-2026-004',
    customer: {
      id: 'cust_4',
      name: 'Zenith Cloud Labs',
      contactPerson: 'Priyanka Iyer',
      email: 'priyanka@zenithcloud.co',
      phone: '+91 94451 77332',
      company: 'Zenith Labs Inc.',
      billingAddress: {
        street: 'Olympia Tech Park, Guindy',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600032',
        country: 'India',
      },
    },
    quotationDate: '2026-09-01',
    expiryDate: '2026-10-01',
    status: 'Expired',
    notes: 'Q3 evaluation quote expired before client procurement clearance.',
    lineItems: [
      {
        id: 'item_401',
        productId: 'prod_2',
        productName: 'Cloud Infrastructure Monitoring Daemon',
        planId: 'plan_3',
        planName: 'Cloud Daemon - Growth Tier',
        billingFrequency: 'Monthly',
        quantity: 1,
        unitPrice: 3499,
        lineTotal: 3499,
      },
    ],
    subtotal: 3499,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 629.82,
    grandTotal: 4128.82,
    subscriptionId: null,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
  },
];

class QuotationService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUOTATIONS));
      }
    } catch {
      // Ignore storage errors
    }
  }

  getQuotations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const quotes = stored ? JSON.parse(stored) : INITIAL_QUOTATIONS;
      // Auto-check expired quotations
      const today = new Date().toISOString().split('T')[0];
      let hasChanges = false;
      const updated = quotes.map((q) => {
        if (q.status === 'Sent' && q.expiryDate && q.expiryDate < today) {
          hasChanges = true;
          return { ...q, status: 'Expired', updatedAt: new Date().toISOString() };
        }
        return q;
      });
      if (hasChanges) {
        this.saveQuotations(updated);
      }
      return updated;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  }

  getQuotationById(id) {
    const list = this.getQuotations();
    return list.find((q) => q.id === id) || null;
  }

  generateQuotationNumber() {
    const list = this.getQuotations();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    return `QT-${year}-${pad}`;
  }

  calculateTotals(lineItems = [], discountType = 'percentage', discountValue = 0, taxRate = 18) {
    const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.lineTotal) || 0), 0);
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * Math.min(Math.max(Number(discountValue) || 0, 0), 100)) / 100;
    } else {
      discountAmount = Math.min(Math.max(Number(discountValue) || 0, 0), subtotal);
    }
    const taxableAmount = Math.max(subtotal - discountAmount, 0);
    const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  createQuotation(data) {
    const list = this.getQuotations();
    const totals = this.calculateTotals(
      data.lineItems,
      data.discountType,
      data.discountValue,
      data.taxRate || 18
    );

    const newQuotation = {
      id: `quot_${Date.now()}`,
      quotationNumber: data.quotationNumber || this.generateQuotationNumber(),
      customer: data.customer,
      quotationDate: data.quotationDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate,
      status: data.status || 'Draft',
      notes: data.notes || '',
      lineItems: data.lineItems || [],
      discountType: data.discountType || 'percentage',
      discountValue: Number(data.discountValue) || 0,
      taxRate: data.taxRate !== undefined ? Number(data.taxRate) : 18,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      subscriptionId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newQuotation, ...list];
    this.saveQuotations(updated);
    return newQuotation;
  }

  updateQuotation(id, data) {
    const list = this.getQuotations();
    const index = list.findIndex((q) => q.id === id);
    if (index === -1) return null;

    // Disallow editing if already confirmed or cancelled unless just linking subscriptionId
    const current = list[index];
    if (
      (current.status === 'Confirmed' || current.status === 'Cancelled') &&
      !data._allowStatusOnly
    ) {
      throw new Error(`Cannot edit quotation in ${current.status} status.`);
    }

    const totals = this.calculateTotals(
      data.lineItems !== undefined ? data.lineItems : current.lineItems,
      data.discountType !== undefined ? data.discountType : current.discountType,
      data.discountValue !== undefined ? data.discountValue : current.discountValue,
      data.taxRate !== undefined ? data.taxRate : current.taxRate
    );

    list[index] = {
      ...current,
      ...data,
      ...totals,
      updatedAt: new Date().toISOString(),
    };

    this.saveQuotations(list);
    return list[index];
  }

  updateQuotationStatus(id, newStatus) {
    const list = this.getQuotations();
    const index = list.findIndex((q) => q.id === id);
    if (index === -1) return null;

    const current = list[index];
    if (current.status === newStatus) return current;

    const allowed = VALID_QUOTATION_TRANSITIONS[current.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid quotation status transition from "${current.status}" to "${newStatus}".`);
    }

    list[index] = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    this.saveQuotations(list);
    return list[index];
  }

  sendQuotation(id) {
    return this.updateQuotationStatus(id, 'Sent');
  }

  confirmQuotation(id) {
    return this.updateQuotationStatus(id, 'Confirmed');
  }

  cancelQuotation(id) {
    return this.updateQuotationStatus(id, 'Cancelled');
  }

  linkSubscription(id, subscriptionId) {
    const list = this.getQuotations();
    const index = list.findIndex((q) => q.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      subscriptionId,
      updatedAt: new Date().toISOString(),
    };
    this.saveQuotations(list);
    return list[index];
  }

  deleteQuotation(id) {
    const list = this.getQuotations();
    const target = list.find((q) => q.id === id);
    if (target && target.status === 'Confirmed') {
      throw new Error('Confirmed quotations cannot be deleted. You may cancel them instead.');
    }
    const filtered = list.filter((q) => q.id !== id);
    this.saveQuotations(filtered);
    return true;
  }

  saveQuotations(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Fallback
    }
  }
}

export const quotationService = new QuotationService();

