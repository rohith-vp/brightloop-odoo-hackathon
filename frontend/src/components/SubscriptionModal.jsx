import React, { useState, useEffect } from 'react';
import { X, Repeat, Building2, Calendar, FileText, Check, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { planService, BILLING_FREQUENCIES } from '../services/planService';
import { customerService } from '../services/customerService';
import { quotationService } from '../services/quotationService';
import { subscriptionService } from '../services/subscriptionService';

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  initialQuotation = null,
}) {
  const [creationMode, setCreationMode] = useState('direct'); // 'quotation' | 'direct'
  const [confirmedQuotations, setConfirmedQuotations] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);

  // Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [billingFrequency, setBillingFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Confirmed'); // Default 'Confirmed' or 'Active'

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const custList = customerService.getCustomers();
      const prodList = productService.getProducts();
      const planList = planService.getPlans();
      const quotes = quotationService
        .getQuotations()
        .filter((q) => q.status === 'Confirmed' && !q.subscriptionId);

      setCustomers(custList);
      setProducts(prodList);
      setPlans(planList);
      setConfirmedQuotations(quotes);

      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);

      if (initialQuotation) {
        // Populating directly from quotation passed as prop
        setCreationMode('quotation');
        loadFromQuotation(initialQuotation, planList, prodList);
      } else {
        setCreationMode('direct');
        resetDirectForm(custList, prodList, planList, today);
      }
      setErrors({});
    }
  }, [isOpen, initialQuotation]);

  const loadFromQuotation = (quote, planList = plans, prodList = products) => {
    setSelectedQuoteId(quote.id);
    setSelectedCustomerId(quote.customer?.id || '');

    const firstItem = quote.lineItems?.[0];
    if (firstItem) {
      setSelectedProductId(firstItem.productId);
      setSelectedPlanId(firstItem.planId);
      setBillingFrequency(firstItem.billingFrequency || 'Monthly');
      setQuantity(firstItem.quantity || 1);
      setUnitPrice(firstItem.unitPrice || 0);

      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      const computedEnd = subscriptionService.calculateEndDate(today, firstItem.billingFrequency || 'Monthly');
      setEndDate(computedEnd);
    } else {
      setUnitPrice(quote.grandTotal || 0);
    }

    setNotes(`Generated from quotation ${quote.quotationNumber}. ${quote.notes || ''}`);
  };

  const resetDirectForm = (custList, prodList, planList, today) => {
    if (custList.length > 0) {
      setSelectedCustomerId(custList[0].id);
    }
    if (prodList.length > 0) {
      const firstProd = prodList[0];
      setSelectedProductId(firstProd.id);
      const matched = planList.filter((p) => p.productId === firstProd.id);
      if (matched.length > 0) {
        setSelectedPlanId(matched[0].id);
        setBillingFrequency(matched[0].billingFrequency);
        setUnitPrice(matched[0].price);
      } else {
        setUnitPrice(firstProd.salesPrice || 0);
      }
    }
    setQuantity(1);
    const computedEnd = subscriptionService.calculateEndDate(today, 'Monthly');
    setEndDate(computedEnd);
    setNotes('');
  };

  if (!isOpen) return null;

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const matched = plans.filter((p) => p.productId === prodId);
    if (matched.length > 0) {
      setSelectedPlanId(matched[0].id);
      setBillingFrequency(matched[0].billingFrequency);
      setUnitPrice(matched[0].price);
      setEndDate(subscriptionService.calculateEndDate(startDate, matched[0].billingFrequency));
    } else {
      const prod = products.find((p) => p.id === prodId);
      setSelectedPlanId('');
      setUnitPrice(prod ? prod.salesPrice : 0);
    }
  };

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setBillingFrequency(plan.billingFrequency);
      setUnitPrice(plan.price);
      setEndDate(subscriptionService.calculateEndDate(startDate, plan.billingFrequency));
    }
  };

  const handleFrequencyChange = (freq) => {
    setBillingFrequency(freq);
    setEndDate(subscriptionService.calculateEndDate(startDate, freq));
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      setEndDate(subscriptionService.calculateEndDate(date, billingFrequency));
    }
  };

  const handleQuotationSelect = (quoteId) => {
    setSelectedQuoteId(quoteId);
    const found = confirmedQuotations.find((q) => q.id === quoteId);
    if (found) {
      loadFromQuotation(found);
    }
  };

  const totalPrice = (Number(quantity) || 1) * (Number(unitPrice) || 0);

  const validate = () => {
    const errs = {};
    if (!selectedCustomerId) errs.customer = 'Please select a customer.';
    if (!selectedProductId) errs.product = 'Please select a product.';
    if (!selectedPlanId) {
      errs.plan = 'Please select a subscription plan.';
    } else {
      const chosenPlan = plans.find((p) => p.id === selectedPlanId);
      if (chosenPlan && planService.getPlanAvailabilityStatus(chosenPlan) === 'Expired') {
        errs.plan = 'Selected plan is expired and no longer available for new subscriptions.';
      }
    }
    if (!startDate) errs.startDate = 'Start date is required.';
    if (!endDate) errs.endDate = 'End date is required.';
    if (endDate && startDate && endDate <= startDate) {
      errs.endDate = 'End date must be after the start date.';
    }
    if ((Number(quantity) || 0) < 1) {
      errs.quantity = 'Quantity must be at least 1.';
    }
    if ((Number(unitPrice) || 0) < 0) {
      errs.unitPrice = 'Price cannot be negative.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (finalStatus = 'Confirmed') => {
    if (!validate()) return;

    const customer = customers.find((c) => c.id === selectedCustomerId);
    const product = products.find((p) => p.id === selectedProductId);
    const plan = plans.find((p) => p.id === selectedPlanId);

    const payload = {
      quotationId: creationMode === 'quotation' ? selectedQuoteId : null,
      customer: customer || { name: 'Customer' },
      productId: selectedProductId,
      productName: product ? product.name : 'Subscription Product',
      planId: selectedPlanId,
      planName: plan ? plan.name : 'Plan',
      billingFrequency,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      totalPrice,
      startDate,
      endDate,
      status: finalStatus,
      notes,
    };

    onSave(payload);
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
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-section)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
              }}
            >
              Create Subscription
            </h2>
            <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Provision recurring subscription contract directly or from an approved quotation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)' }}
          >
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
          {/* Mode Selector Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '4px',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setCreationMode('direct')}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: creationMode === 'direct' ? 'var(--color-surface-white)' : 'transparent',
                color: creationMode === 'direct' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: creationMode === 'direct' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Option 1: Create Directly
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('quotation')}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: creationMode === 'quotation' ? 'var(--color-surface-white)' : 'transparent',
                color: creationMode === 'quotation' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: creationMode === 'quotation' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Option 2: From Confirmed Quotation ({confirmedQuotations.length})
            </button>
          </div>

          {/* Quotation picker when mode is 'quotation' */}
          {creationMode === 'quotation' && (
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-green)',
                border: '1px solid #C4E2D2',
              }}
            >
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)', color: 'var(--color-primary)' }}>
                Select Confirmed Quotation
              </label>
              {confirmedQuotations.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                  No unlinked confirmed quotations available. You can create a direct subscription or confirm a quotation first.
                </p>
              ) : (
                <select
                  value={selectedQuoteId}
                  onChange={(e) => handleQuotationSelect(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: 'var(--font-size-input)', marginTop: '4px' }}
                >
                  <option value="">-- Choose Quotation --</option>
                  {confirmedQuotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quotationNumber} - {q.customer?.name} (₹{q.grandTotal.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
              Customer Account <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="input-field"
              style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              disabled={creationMode === 'quotation' && !!selectedQuoteId}
            >
              <option value="">Select customer directory</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.contactPerson}) - {c.email}
                </option>
              ))}
            </select>
            {errors.customer && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                {errors.customer}
              </p>
            )}
          </div>

          {/* Product & Plan Pairing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Product <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              >
                <option value="">Select product</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name}
                  </option>
                ))}
              </select>
              {errors.product && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.product}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Subscription Plan <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              >
                <option value="">Select plan</option>
                {plans
                  .filter((p) => !selectedProductId || p.productId === selectedProductId)
                  .map((pl) => {
                    const status = planService.getPlanAvailabilityStatus(pl);
                    const isExpired = status === 'Expired';
                    return (
                      <option key={pl.id} value={pl.id} disabled={isExpired}>
                        {pl.name} ({pl.billingFrequency}) - ₹{pl.price.toLocaleString('en-IN')}
                        {isExpired ? ' [Expired]' : status === 'Upcoming' ? ' [Upcoming]' : ''}
                      </option>
                    );
                  })}
              </select>
              {errors.plan && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.plan}
                </p>
              )}
            </div>
          </div>

          {/* Quantity, Frequency & Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Quantity <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              />
              {errors.quantity && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              >
                {BILLING_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Unit Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Total Recurring Amount
              </label>
              <div
                style={{
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 var(--space-4)',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '17px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                }}
              >
                ₹{totalPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Start Date <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              />
              {errors.startDate && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                End Date (Scheduled Expiry) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
              />
              {errors.endDate && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
              Contract Notes & Fulfillment Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provisioning instructions, SLA specifications, or client contact agreements..."
              className="input-field"
              style={{ fontSize: 'var(--font-size-input)', resize: 'vertical' }}
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
            backgroundColor: 'var(--color-surface-white)',
          }}
        >
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '10px 18px' }}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => handleSubmit('Confirmed')}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontWeight: 'var(--font-weight-medium)' }}
            >
              Create as Confirmed
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Active')}
              className="btn-primary"
              style={{ padding: '10px 22px', fontWeight: 'var(--font-weight-medium)' }}
            >
              Create & Activate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

