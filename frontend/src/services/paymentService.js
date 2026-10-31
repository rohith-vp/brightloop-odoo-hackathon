/**
 * Payments Mock Service Layer
 * Supports payment recording, partial payments, transaction reconciliation,
 * and automated invoice balance updates.
 */

import { planService } from './planService.js';
import { invoiceService } from './invoiceService.js';
import { customerService } from './customerService.js';

const STORAGE_KEY = 'brightloop_payments_data';

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Card',
  'Cash',
  'Other',
];

const INITIAL_PAYMENTS = [
  {
    id: 'pay_1',
    paymentReference: 'PAY-2026-001',
    customerId: 'cust_1',
    customerName: 'TechCorp Solutions Pvt Ltd',
    invoiceId: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    amount: 11797.64,
    paymentDate: '2026-10-21',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'NEFT-HDFC-992144502',
    notes: 'Full payment received for initial Odoo Connector deployment.',
    createdAt: '2026-10-21T15:30:00Z',
  },
  {
    id: 'pay_2',
    paymentReference: 'PAY-2026-002',
    customerId: 'cust_2',
    customerName: 'Nexus FinTech Enterprises',
    invoiceId: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    amount: 6000,
    paymentDate: '2026-09-10',
    paymentMethod: 'UPI',
    referenceNumber: 'UPI-98214400234@okaxis',
    notes: 'First tranche partial payment for Cloud Daemon monitoring retainer.',
    createdAt: '2026-09-10T14:00:00Z',
  },
];

class PaymentService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
      }
    } catch {
      // storage fallback
    }
  }

  generatePaymentReference() {
    const list = this.getPayments();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    return `PAY-${year}-${pad}`;
  }

  getPayments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  }

  getPaymentById(id) {
    const list = this.getPayments();
    return list.find((p) => p.id === id) || null;
  }

  getPaymentsByInvoice(invoiceId) {
    const list = this.getPayments();
    return list.filter((p) => p.invoiceId === invoiceId);
  }

  getPaymentsByCustomer(customerId) {
    if (!customerId) return [];
    const list = this.getPayments();
    return list.filter((p) => p.customerId === customerId);
  }

  getPaymentForCustomer(id, customerId) {
    if (!customerId) throw new Error('Customer ID is required.');
    const pay = this.getPaymentById(id);
    if (!pay) return null;
    if (pay.customerId !== customerId) {
      throw new Error('Access denied: You do not have permission to view this payment.');
    }
    return pay;
  }

  validatePayment(data) {
    const errors = {};

    if (!data.customerId) {
      errors.customerId = 'Customer is required.';
    }

    if (!data.invoiceId) {
      errors.invoiceId = 'Invoice is required.';
    }

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Payment amount must be greater than zero.';
    }

    if (data.invoiceId) {
      const inv = invoiceService.getInvoiceById(data.invoiceId);
      if (!inv) {
        errors.invoiceId = 'Invoice not found.';
      } else {
        if (inv.status === 'Cancelled') {
          errors.invoiceId = 'Cannot record payment on a cancelled invoice.';
        } else if (inv.balanceDue <= 0) {
          errors.invoiceId = 'This invoice is already fully paid.';
        } else if (amount > inv.balanceDue) {
          errors.amount = `Payment amount ₹${amount.toLocaleString('en-IN')} exceeds remaining balance ₹${inv.balanceDue.toLocaleString('en-IN')}.`;
        }
      }
    }

    if (!data.paymentMethod) {
      errors.paymentMethod = 'Payment method is required.';
    }

    return errors;
  }

  recordPayment(data) {
    const errors = this.validatePayment(data);
    if (Object.keys(errors).length > 0) {
      throw new Error(Object.values(errors)[0]);
    }

    const inv = invoiceService.getInvoiceById(data.invoiceId);
    const customer = customerService.getCustomerById(data.customerId) || inv.customer;
    const paymentRef = data.paymentReference || this.generatePaymentReference();
    const amount = Number(data.amount);

    // 1. Reconcile on the invoice
    invoiceService.recordPaymentOnInvoice(inv.id, amount);

    // 2. Create the payment record
    const newPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      paymentReference: paymentRef,
      customerId: data.customerId,
      customerName: customer ? customer.name : (inv.customer?.name || 'Customer'),
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount,
      paymentDate: data.paymentDate || planService.getCurrentDate(),
      paymentMethod: data.paymentMethod || 'Bank Transfer',
      referenceNumber: data.referenceNumber ? data.referenceNumber.trim() : `TXN-${Date.now()}`,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    const list = this.getPayments();
    const updated = [newPayment, ...list];
    this.savePayments(updated);

    return newPayment;
  }

  savePayments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage fallback
    }
  }
}

export const paymentService = new PaymentService();

