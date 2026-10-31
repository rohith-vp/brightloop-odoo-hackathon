import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { BILLING_FREQUENCIES, PLAN_STATUSES } from '../services/planService';

export default function PlanModal({ isOpen, onClose, onSave, initialData = null }) {
  const isEditing = Boolean(initialData && initialData.id);

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    billingFrequency: 'Monthly',
    price: '',
    minQuantity: 1,
    startDate: '',
    endDate: '',
    status: 'active',
    lifecycle: {
      closureMode: 'manual',
      allowEarlyClosure: true,
      allowPause: true,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const prods = productService.getProducts();
    setProducts(prods);

    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        productId: initialData.productId || (prods[0]?.id || ''),
        billingFrequency: initialData.billingFrequency || 'Monthly',
        price: initialData.price !== undefined ? initialData.price : '',
        minQuantity: initialData.minQuantity !== undefined ? initialData.minQuantity : 1,
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        status: initialData.status || 'active',
        lifecycle: {
          closureMode: initialData.lifecycle?.closureMode || 'manual',
          allowEarlyClosure: initialData.lifecycle?.allowEarlyClosure ?? true,
          allowPause: initialData.lifecycle?.allowPause ?? true,
          renewalMode: initialData.lifecycle?.renewalMode || 'auto',
          renewalEnabled: initialData.lifecycle?.renewalEnabled ?? true,
        },
      });
    } else {
      setFormData({
        name: '',
        description: '',
        productId: prods[0]?.id || '',
        billingFrequency: 'Monthly',
        price: '',
        minQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
        lifecycle: {
          closureMode: 'manual',
          allowEarlyClosure: true,
          allowPause: true,
          renewalMode: 'auto',
          renewalEnabled: true,
        },
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Plan name is required';
    }

    if (!formData.productId) {
      errs.productId = 'Please select an associated product';
    }

    if (formData.price === '' || Number(formData.price) < 0) {
      errs.price = 'Billing price must be 0 or greater';
    }

    if (formData.minQuantity === '' || Number(formData.minQuantity) < 1) {
      errs.minQuantity = 'Minimum quantity must be at least 1';
    }

    // Availability dates validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errs.endDate = 'End date cannot be earlier than start date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLifecycleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      lifecycle: {
        ...prev.lifecycle,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 25, 24, 0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-dropdown)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: '#FAFCFB',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-section)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
              {isEditing
                ? 'Update billing terms, pricing, and lifecycle parameters.'
                : 'Configure a new subscription tier with custom lifecycle rules.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="btn-icon"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Section 1: Basic Information */}
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              1. Basic Information
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label
                  htmlFor="plan-name"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Plan Name <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
                </label>
                <input
                  id="plan-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Odoo Connector - Monthly Business"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-input)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${errors.name ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Associated Product & Billing Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label
                    htmlFor="plan-product"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-form-label)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Select Product <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
                  </label>
                  <select
                    id="plan-product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '10px 14px',
                      fontSize: 'var(--font-size-input)',
                      color: 'var(--color-text-main)',
                      backgroundColor: 'var(--color-surface)',
                      border: `1px solid ${errors.productId ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    {products.length === 0 ? (
                      <option value="">No products available</option>
                    ) : (
                      products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type})
                        </option>
                      ))
                    )}
                  </select>
                  {errors.productId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                      <AlertCircle size={14} />
                      <span>{errors.productId}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="plan-frequency"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-form-label)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Billing Frequency <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
                  </label>
                  <select
                    id="plan-frequency"
                    name="billingFrequency"
                    value={formData.billingFrequency}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '10px 14px',
                      fontSize: 'var(--font-size-input)',
                      color: 'var(--color-text-main)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    {BILLING_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label
                    htmlFor="plan-desc"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-form-label)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Description <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-helper)' }}>(Optional)</span>
                  </label>
                  <input
                    id="plan-desc"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description of this subscription plan..."
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '10px 14px',
                      fontSize: 'var(--font-size-input)',
                      color: 'var(--color-text-main)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-status"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-form-label)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Status
                  </label>
                  <select
                    id="plan-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '10px 14px',
                      fontSize: 'var(--font-size-input)',
                      color: 'var(--color-text-main)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Quantity */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              2. Pricing & Minimum Quantity
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label
                  htmlFor="plan-price"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Billing Price (₹) <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
                </label>
                <input
                  id="plan-price"
                  name="price"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 4999"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-input)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${errors.price ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.price && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{errors.price}</span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="plan-minQty"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Minimum Quantity <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
                </label>
                <input
                  id="plan-minQty"
                  name="minQuantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  placeholder="1"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-input)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${errors.minQuantity ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.minQuantity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{errors.minQuantity}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Availability Dates */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              3. Availability Period
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label
                  htmlFor="plan-startDate"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Start Date
                </label>
                <input
                  id="plan-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-input)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="plan-endDate"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  End Date <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-helper)' }}>(Optional expiry)</span>
                </label>
                <input
                  id="plan-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-input)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${errors.endDate ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.endDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{errors.endDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Plan Lifecycle Configuration */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              4. Lifecycle Configuration
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
                backgroundColor: '#FAFCFB',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {/* Closure Setting */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Closure Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="closureMode"
                      value="manual"
                      checked={formData.lifecycle.closureMode === 'manual'}
                      onChange={() => handleLifecycleChange('closureMode', 'manual')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Manual closure (admin/user initiated)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="closureMode"
                      value="automatic"
                      checked={formData.lifecycle.closureMode === 'automatic'}
                      onChange={() => handleLifecycleChange('closureMode', 'automatic')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Automatic closure at expiry</span>
                  </label>
                </div>
              </div>

              {/* Renewal Setting */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Renewal Policy
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.lifecycle.renewalEnabled}
                      onChange={(e) => handleLifecycleChange('renewalEnabled', e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Allow subscription renewal</span>
                  </label>

                  {formData.lifecycle.renewalEnabled && (
                    <div style={{ display: 'flex', gap: '16px', marginLeft: '24px', marginTop: '2px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-helper)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="renewalMode"
                          value="auto"
                          checked={formData.lifecycle.renewalMode === 'auto'}
                          onChange={() => handleLifecycleChange('renewalMode', 'auto')}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span>Auto-renew</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-helper)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="renewalMode"
                          value="manual"
                          checked={formData.lifecycle.renewalMode === 'manual'}
                          onChange={() => handleLifecycleChange('renewalMode', 'manual')}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span>Manual renew</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Early Closure */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Early Closure Policy
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.lifecycle.allowEarlyClosure}
                    onChange={(e) => handleLifecycleChange('allowEarlyClosure', e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>Allow early cancellation before end date</span>
                </label>
              </div>

              {/* Pause Policy */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-form-label)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Pause Functionality
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.lifecycle.allowPause}
                    onChange={(e) => handleLifecycleChange('allowPause', e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>Allow temporary subscription pause</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

