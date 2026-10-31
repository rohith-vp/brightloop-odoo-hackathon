import React, { useState, useEffect } from 'react';
import { X, Percent, Tag, Calendar, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { discountService, DISCOUNT_TYPES, DISCOUNT_APPLICABILITIES } from '../services/discountService.js';

export default function DiscountModal({ isOpen, onClose, onSave, discountToEdit = null }) {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('0');
  const [minQuantity, setMinQuantity] = useState('1');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxUsageLimit, setMaxUsageLimit] = useState('');
  const [applicability, setApplicability] = useState('all');
  const [applicableProductIds, setApplicableProductIds] = useState([]);
  const [applicableSubscriptionIds, setApplicableSubscriptionIds] = useState([]);
  const [status, setStatus] = useState('active');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setProducts(productService.getProducts());
      setSubscriptions(subscriptionService.getSubscriptions());

      if (discountToEdit) {
        setName(discountToEdit.name || '');
        setCode(discountToEdit.code || '');
        setDescription(discountToEdit.description || '');
        setType(discountToEdit.type || 'percentage');
        setValue(String(discountToEdit.value !== undefined ? discountToEdit.value : ''));
        setMinPurchaseAmount(String(discountToEdit.minPurchaseAmount || '0'));
        setMinQuantity(String(discountToEdit.minQuantity || '1'));
        setValidFrom(discountToEdit.validFrom || '');
        setValidUntil(discountToEdit.validUntil || '');
        setMaxUsageLimit(discountToEdit.maxUsageLimit ? String(discountToEdit.maxUsageLimit) : '');
        setApplicability(discountToEdit.applicability || 'all');
        setApplicableProductIds(discountToEdit.applicableProductIds || []);
        setApplicableSubscriptionIds(discountToEdit.applicableSubscriptionIds || []);
        setStatus(discountToEdit.status || 'active');
      } else {
        setName('');
        setCode('');
        setDescription('');
        setType('percentage');
        setValue('10');
        setMinPurchaseAmount('0');
        setMinQuantity('1');
        setValidFrom(new Date().toISOString().split('T')[0]);
        setValidUntil('');
        setMaxUsageLimit('');
        setApplicability('all');
        setApplicableProductIds([]);
        setApplicableSubscriptionIds([]);
        setStatus('active');
      }
      setErrors({});
    }
  }, [isOpen, discountToEdit]);

  if (!isOpen) return null;

  const handleToggleProduct = (prodId) => {
    if (applicableProductIds.includes(prodId)) {
      setApplicableProductIds(applicableProductIds.filter((id) => id !== prodId));
    } else {
      setApplicableProductIds([...applicableProductIds, prodId]);
    }
  };

  const handleToggleSubscription = (subId) => {
    if (applicableSubscriptionIds.includes(subId)) {
      setApplicableSubscriptionIds(applicableSubscriptionIds.filter((id) => id !== subId));
    } else {
      setApplicableSubscriptionIds([...applicableSubscriptionIds, subId]);
    }
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Discount name is required.';
    const numVal = Number(value);
    if (value === '' || isNaN(numVal) || numVal < 0) {
      errs.value = 'Discount value must be a non-negative number.';
    } else if (type === 'percentage' && numVal > 100) {
      errs.value = 'Percentage discount cannot exceed 100%.';
    }

    if (minPurchaseAmount !== '' && Number(minPurchaseAmount) < 0) {
      errs.minPurchaseAmount = 'Minimum purchase amount cannot be negative.';
    }
    if (maxUsageLimit !== '' && Number(maxUsageLimit) <= 0) {
      errs.maxUsageLimit = 'Max usage limit must be positive when specified.';
    }
    if (validFrom && validUntil && validUntil < validFrom) {
      errs.validUntil = 'End date cannot be earlier than start date.';
    }

    if (applicability === 'specific_products' && applicableProductIds.length === 0) {
      errs.applicability = 'Please select at least one applicable product.';
    }
    if (applicability === 'specific_subscriptions' && applicableSubscriptionIds.length === 0) {
      errs.applicability = 'Please select at least one applicable subscription.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name,
      code: code.trim() || undefined,
      description,
      type,
      value: Number(value),
      minPurchaseAmount: Number(minPurchaseAmount) || 0,
      minQuantity: Math.max(1, Number(minQuantity) || 1),
      validFrom,
      validUntil,
      maxUsageLimit: maxUsageLimit ? Number(maxUsageLimit) : null,
      applicability,
      applicableProductIds,
      applicableSubscriptionIds,
      status,
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
          maxWidth: '740px',
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
              <Percent size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-heading-section)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                {discountToEdit ? `Edit Discount (${discountToEdit.name})` : 'Create Discount Campaign'}
              </h2>
              <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                Configure concession rules, eligibility constraints, and usage limits.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              padding: 'var(--space-6)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              flex: 1,
            }}
          >
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Discount Campaign Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Enterprise Concession"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                />
                {errors.name && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Promo Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Description
              </label>
              <input
                type="text"
                placeholder="Brief internal note or customer-facing promo description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: '14px' }}
              />
            </div>

            {/* Type & Value */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '15px' }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Value {type === 'percentage' ? '(%)' : '(₹)'} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percentage' ? '15' : '1000'}
                  className="input-field"
                  style={{ height: '44px', fontSize: '16px', fontWeight: 'var(--font-weight-semibold)' }}
                />
                {errors.value && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.value}
                  </p>
                )}
              </div>
            </div>

            {/* Threshold Conditions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Min Purchase (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Min Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Max Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={maxUsageLimit}
                  onChange={(e) => setMaxUsageLimit(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '14px' }}
                />
                {errors.maxUsageLimit && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.maxUsageLimit}
                  </p>
                )}
              </div>
            </div>

            {/* Validity Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Valid From (Start Date)
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Valid Until (End Date - Optional)
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="input-field"
                  style={{ height: '44px', fontSize: '14px' }}
                />
                {errors.validUntil && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                    {errors.validUntil}
                  </p>
                )}
              </div>
            </div>

            {/* Applicability Scope */}
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Applicability Scope
              </label>
              <select
                value={applicability}
                onChange={(e) => setApplicability(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: '15px' }}
              >
                <option value="all">All Products and Subscriptions</option>
                <option value="specific_products">Specific Products Only</option>
                <option value="specific_subscriptions">Specific Subscriptions Only</option>
              </select>

              {errors.applicability && (
                <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '3px' }}>
                  {errors.applicability}
                </p>
              )}

              {applicability === 'specific_products' && (
                <div style={{ marginTop: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', maxHeight: '160px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Select Eligible Products:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {products.map((p) => {
                      const isChecked = applicableProductIds.includes(p.id);
                      return (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProduct(p.id)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span>{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {applicability === 'specific_subscriptions' && (
                <div style={{ marginTop: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', maxHeight: '160px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Select Eligible Subscriptions:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {subscriptions.map((s) => {
                      const isChecked = applicableSubscriptionIds.includes(s.id);
                      return (
                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSubscription(s.id)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span>
                            {s.subscriptionNumber} - {s.customer?.name} ({s.productName})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <button type="submit" className="btn-primary" style={{ padding: '9px 22px' }}>
              {discountToEdit ? 'Save Changes' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

