import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, Building2, Receipt, CheckCircle2 } from 'lucide-react';
import { customerService } from '../services/customerService.js';
import { invoiceService } from '../services/invoiceService.js';
import { paymentService, PAYMENT_METHODS } from '../services/paymentService.js';
import { planService } from '../services/planService.js';

export default function PaymentModal({ isOpen, onClose, onSave, preselectedInvoice = null }) {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const custList = customerService.getCustomers();
      const allInvoices = invoiceService.getInvoices();
      setCustomers(custList);
      setInvoices(allInvoices);

      const today = planService.getCurrentDate();
      setPaymentDate(today);

      if (preselectedInvoice) {
        setSelectedCustomerId(preselectedInvoice.customerId || preselectedInvoice.customer?.id || '');
        setSelectedInvoiceId(preselectedInvoice.id);
        setAmount(String(preselectedInvoice.balanceDue || ''));
      } else if (custList.length > 0) {
        setSelectedCustomerId(custList[0].id);
        const customerUnpaidInvoices = allInvoices.filter(
          (i) => (i.customerId === custList[0].id || i.customer?.id === custList[0].id) && i.balanceDue > 0 && i.status !== 'Cancelled'
        );
        if (customerUnpaidInvoices.length > 0) {
          setSelectedInvoiceId(customerUnpaidInvoices[0].id);
          setAmount(String(customerUnpaidInvoices[0].balanceDue || ''));
        } else {
          setSelectedInvoiceId('');
          setAmount('');
        }
      }

      setPaymentMethod('Bank Transfer');
      setReferenceNumber(`TXN-${Date.now().toString().slice(-6)}`);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, preselectedInvoice]);

  if (!isOpen) return null;

  const handleCustomerChange = (custId) => {
    setSelectedCustomerId(custId);
    const customerUnpaidInvoices = invoices.filter(
      (i) => (i.customerId === custId || i.customer?.id === custId) && i.balanceDue > 0 && i.status !== 'Cancelled'
    );
    if (customerUnpaidInvoices.length > 0) {
      setSelectedInvoiceId(customerUnpaidInvoices[0].id);
      setAmount(String(customerUnpaidInvoices[0].balanceDue || ''));
    } else {
      setSelectedInvoiceId('');
      setAmount('');
    }
  };

  const handleInvoiceChange = (invId) => {
    setSelectedInvoiceId(invId);
    const found = invoices.find((i) => i.id === invId);
    if (found) {
      setAmount(String(found.balanceDue || ''));
    }
  };

  const unpaidInvoices = invoices.filter(
    (i) => (i.customerId === selectedCustomerId || i.customer?.id === selectedCustomerId) && i.balanceDue > 0 && i.status !== 'Cancelled'
  );

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const validate = () => {
    const errs = {};
    if (!selectedCustomerId) errs.customer = 'Please select a customer.';
    if (!selectedInvoiceId) errs.invoice = 'Please select an invoice with an outstanding balance.';
    if (!paymentDate) errs.paymentDate = 'Payment date is required.';

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Payment amount must be greater than zero.';
    } else if (selectedInvoice && numAmount > selectedInvoice.balanceDue) {
      errs.amount = `Amount cannot exceed remaining balance (₹${selectedInvoice.balanceDue.toLocaleString('en-IN')}).`;
    }

    if (!paymentMethod) errs.paymentMethod = 'Please choose a payment method.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const paymentRecord = paymentService.recordPayment({
        customerId: selectedCustomerId,
        invoiceId: selectedInvoiceId,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
      });

      onSave(paymentRecord);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 25, 24, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-green)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-heading-section)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                Record Payment
              </h2>
              <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                Reconcile full or partial payment against outstanding invoices.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              padding: 'var(--space-6)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              flex: 1,
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Customer & Invoice Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Customer <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                  disabled={Boolean(preselectedInvoice)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.customer}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Outstanding Invoice <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                {unpaidInvoices.length === 0 ? (
                  <div style={{ padding: '10px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    No outstanding invoices for this customer.
                  </div>
                ) : (
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    className="input-field"
                    style={{ height: '44px', fontSize: '15px' }}
                    disabled={Boolean(preselectedInvoice)}
                  >
                    {unpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - Bal: ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                )}
                {errors.invoice && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.invoice}
                  </p>
                )}
              </div>
            </div>

            {/* Selected Invoice Summary Box */}
            {selectedInvoice && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-2)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Invoice Total</span>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    ₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Already Paid</span>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '2px' }}>
                    ₹{(selectedInvoice.amountPaid || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Outstanding Balance</span>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)', marginTop: '2px' }}>
                    ₹{selectedInvoice.balanceDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Payment Amount (₹) <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="input-field"
                  style={{ height: '44px', fontSize: '16px', fontWeight: 'var(--font-weight-semibold)' }}
                />
                {errors.amount && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Payment Date <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                />
                {errors.paymentDate && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.paymentDate}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method & Reference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Payment Method <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Transaction / UTR Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-982144502"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Internal Reconciliation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Bank statement narration, cheque details or settlement reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                style={{ fontSize: '14px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '9px 22px' }}>
              Confirm & Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

