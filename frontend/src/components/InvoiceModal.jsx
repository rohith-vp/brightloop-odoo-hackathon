import React, { useState, useEffect } from 'react';
import { X, Receipt, Building2, Calendar, AlertCircle, Percent } from 'lucide-react';
import { customerService } from '../services/customerService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { invoiceService } from '../services/invoiceService.js';
import { discountService } from '../services/discountService.js';
import { planService } from '../services/planService.js';

export default function InvoiceModal({ isOpen, onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [taxRate, setTaxRate] = useState(18);
  const [status, setStatus] = useState('Confirmed');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const custList = customerService.getCustomers();
      const allSubs = subscriptionService.getSubscriptions();
      setCustomers(custList);
      setSubscriptions(allSubs);

      const today = planService.getCurrentDate();
      setInvoiceDate(today);

      const [y, m, d] = today.split('-').map(Number);
      const dueObj = new Date(Date.UTC(y, m - 1, d + 15));
      setDueDate(dueObj.toISOString().split('T')[0]);

      if (custList.length > 0) {
        setSelectedCustomerId(custList[0].id);
        const customerSubs = allSubs.filter((s) => s.customer?.id === custList[0].id && s.status === 'Active');
        if (customerSubs.length > 0) {
          setSelectedSubscriptionId(customerSubs[0].id);
          const period = invoiceService.calculateBillingPeriod(customerSubs[0], today);
          setPeriodStart(period.startDate);
          setPeriodEnd(period.endDate);
        } else {
          setSelectedSubscriptionId('');
          setPeriodStart(today);
          setPeriodEnd(today);
        }
      }
      setDiscountCode('');
      setAppliedDiscount(null);
      setTaxRate(18);
      setStatus('Confirmed');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomerChange = (custId) => {
    setSelectedCustomerId(custId);
    const customerSubs = subscriptions.filter((s) => s.customer?.id === custId && s.status === 'Active');
    if (customerSubs.length > 0) {
      setSelectedSubscriptionId(customerSubs[0].id);
      const period = invoiceService.calculateBillingPeriod(customerSubs[0], invoiceDate);
      setPeriodStart(period.startDate);
      setPeriodEnd(period.endDate);
    } else {
      setSelectedSubscriptionId('');
    }
    setAppliedDiscount(null);
  };

  const handleSubscriptionChange = (subId) => {
    setSelectedSubscriptionId(subId);
    const sub = subscriptions.find((s) => s.id === subId);
    if (sub) {
      const period = invoiceService.calculateBillingPeriod(sub, invoiceDate);
      setPeriodStart(period.startDate);
      setPeriodEnd(period.endDate);
    }
    setAppliedDiscount(null);
  };

  const activeCustomerSubs = subscriptions.filter(
    (s) => s.customer?.id === selectedCustomerId && s.status === 'Active'
  );

  const selectedSub = subscriptions.find((s) => s.id === selectedSubscriptionId);
  const subtotal = selectedSub ? (selectedSub.quantity || 1) * (selectedSub.unitPrice || 0) : 0;

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    const res = discountService.evaluateDiscount({
      discountCode,
      subtotal,
      quantity: selectedSub ? selectedSub.quantity : 1,
      productId: selectedSub ? selectedSub.productId : null,
      subscriptionId: selectedSub ? selectedSub.id : null,
      currentDate: invoiceDate,
    });

    if (res.eligible) {
      setAppliedDiscount(res);
      setErrors((prev) => ({ ...prev, discount: '' }));
    } else {
      setAppliedDiscount(null);
      setErrors((prev) => ({ ...prev, discount: res.reason }));
    }
  };

  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const totals = invoiceService.calculateTotals(
    selectedSub
      ? [
          {
            lineTotal: subtotal,
          },
        ]
      : [],
    discountAmount,
    taxRate
  );

  const validate = () => {
    const errs = {};
    if (!selectedCustomerId) errs.customer = 'Please select a customer.';
    if (!selectedSubscriptionId) errs.subscription = 'Please select an active subscription.';
    if (!invoiceDate) errs.invoiceDate = 'Invoice date is required.';
    if (!dueDate) errs.dueDate = 'Due date is required.';
    if (dueDate && invoiceDate && dueDate < invoiceDate) {
      errs.dueDate = 'Due date cannot precede invoice date.';
    }

    if (selectedSub && periodStart && periodEnd) {
      if (invoiceService.hasExistingInvoiceForPeriod(selectedSub.id, periodStart, periodEnd)) {
        errs.period = `An invoice already exists for ${selectedSub.subscriptionNumber} for billing period ${periodStart} to ${periodEnd}.`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (finalStatus = status) => {
    if (!validate()) return;

    try {
      const inv = invoiceService.generateFromSubscription(selectedSub.id, {
        billingDate: invoiceDate,
        billingPeriod: { startDate: periodStart, endDate: periodEnd },
        discountId: appliedDiscount?.discount?.id,
        discountCode: appliedDiscount?.discount?.code,
        taxRate: Number(taxRate) || 18,
        status: finalStatus,
      });
      onSave(inv);
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
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
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
            backgroundColor: 'var(--color-surface-white)',
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
              <Receipt size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-heading-section)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                Generate Single Invoice
              </h2>
              <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                Bill customer for active subscription cycle with automated discount checks.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {errors.period && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FDE8E8',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errors.period}</span>
            </div>
          )}

          {/* Customer & Subscription */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Select Customer <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: '15px' }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '4px' }}>
                  {errors.customer}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Active Subscription <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              {activeCustomerSubs.length === 0 ? (
                <div style={{ padding: '10px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  No active subscriptions found for this customer.
                </div>
              ) : (
                <select
                  value={selectedSubscriptionId}
                  onChange={(e) => handleSubscriptionChange(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                >
                  {activeCustomerSubs.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subscriptionNumber} - {sub.productName} ({sub.billingFrequency})
                    </option>
                  ))}
                </select>
              )}
              {errors.subscription && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '4px' }}>
                  {errors.subscription}
                </p>
              )}
            </div>
          </div>

          {/* Dates & Billing Period */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '14px' }}
              />
              {errors.dueDate && (
                <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '2px' }}>
                  {errors.dueDate}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Period Start
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Period End
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Item Preview */}
          {selectedSub && (
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>
                Subscription Items to Incur
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: '15px' }}>
                    {selectedSub.productName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Plan: {selectedSub.planName} ({selectedSub.quantity} × ₹{(selectedSub.unitPrice || 0).toLocaleString('en-IN')})
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Discount & Taxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Apply Promo / Discount Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE15"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="input-field"
                  style={{ height: '42px', fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="btn-secondary"
                  style={{ height: '42px', padding: '0 14px', fontSize: '13px' }}
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <p style={{ color: 'var(--color-primary)', fontSize: '13px', marginTop: '4px', fontWeight: 'var(--font-weight-medium)' }}>
                  ✓ {appliedDiscount.discount.name} (-₹{appliedDiscount.discountAmount.toLocaleString('en-IN')})
                </p>
              )}
              {errors.discount && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '4px' }}>
                  {errors.discount}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Tax Rate (GST %)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal:</span>
              <span style={{ color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                ₹{totals.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-primary)' }}>
                <span>Discount ({appliedDiscount?.discount?.code}):</span>
                <span>-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span>Tax ({taxRate}% GST):</span>
              <span style={{ color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                +₹{totals.taxAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                Grand Total:
              </span>
              <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                ₹{totals.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
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
            backgroundColor: 'var(--color-surface-white)',
          }}
        >
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px' }}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="btn-secondary"
              style={{ padding: '9px 18px' }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Confirmed')}
              className="btn-primary"
              style={{ padding: '9px 20px' }}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

