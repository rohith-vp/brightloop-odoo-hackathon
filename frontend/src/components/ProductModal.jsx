import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { PRODUCT_TYPES } from '../services/productService';

export default function ProductModal({ isOpen, onClose, onSave, initialData = null }) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    name: '',
    type: PRODUCT_TYPES[0],
    salesPrice: '',
    costPrice: '',
    status: 'active',
    notes: '',
  });

  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || PRODUCT_TYPES[0],
        salesPrice: initialData.salesPrice !== undefined ? initialData.salesPrice : '',
        costPrice: initialData.costPrice !== undefined ? initialData.costPrice : '',
        status: initialData.status || 'active',
        notes: initialData.notes || '',
      });
      setVariants(
        Array.isArray(initialData.variants)
          ? initialData.variants.map((v) => ({ ...v }))
          : []
      );
    } else {
      setFormData({
        name: '',
        type: PRODUCT_TYPES[0],
        salesPrice: '',
        costPrice: '',
        status: 'active',
        notes: '',
      });
      setVariants([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Product name is required';
    }
    if (!formData.type) {
      errs.type = 'Product type is required';
    }
    if (formData.salesPrice === '' || Number(formData.salesPrice) < 0) {
      errs.salesPrice = 'Sales price must be 0 or greater';
    }
    if (formData.costPrice === '' || Number(formData.costPrice) < 0) {
      errs.costPrice = 'Cost price must be 0 or greater';
    }

    // Validate variants
    const variantErrors = [];
    variants.forEach((v, idx) => {
      if (!v.name.trim()) {
        variantErrors.push(`Variant #${idx + 1} requires a name`);
      }
      if (v.additionalPrice === '' || Number(v.additionalPrice) < 0) {
        variantErrors.push(`Variant #${idx + 1} additional price must be 0 or greater`);
      }
    });

    if (variantErrors.length > 0) {
      errs.variants = variantErrors[0];
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

  // Variant operations
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var_${Date.now()}_${prev.length}`,
        name: '',
        additionalPrice: 0,
        status: 'active',
      },
    ]);
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    if (errors.variants) {
      setErrors((prev) => ({ ...prev, variants: '' }));
    }
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      variants,
    });
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
          maxWidth: '640px',
          maxHeight: '90vh',
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
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
              {isEditing
                ? 'Update product details and pricing tiers.'
                : 'Configure a new subscription item or add-on.'}
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
          {/* Product Name */}
          <div>
            <label
              htmlFor="prod-name"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-form-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-main)',
                marginBottom: '6px',
              }}
            >
              Product Name <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
            </label>
            <input
              id="prod-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Odoo Subscription Connector"
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

          {/* Product Type & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label
                htmlFor="prod-type"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-form-label)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-main)',
                  marginBottom: '6px',
                }}
              >
                Product Type <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
              </label>
              <select
                id="prod-type"
                name="type"
                value={formData.type}
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
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="prod-status"
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
                id="prod-status"
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
              </select>
            </div>
          </div>

          {/* Pricing: Sales Price & Cost Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label
                htmlFor="prod-salesPrice"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-form-label)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-main)',
                  marginBottom: '6px',
                }}
              >
                Sales Price (₹) <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
              </label>
              <input
                id="prod-salesPrice"
                name="salesPrice"
                type="number"
                min="0"
                step="any"
                value={formData.salesPrice}
                onChange={handleChange}
                placeholder="0.00"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '10px 14px',
                  fontSize: 'var(--font-size-input)',
                  color: 'var(--color-text-main)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${errors.salesPrice ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errors.salesPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                  <AlertCircle size={14} />
                  <span>{errors.salesPrice}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-costPrice"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-form-label)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-main)',
                  marginBottom: '6px',
                }}
              >
                Cost Price (₹) <span style={{ color: 'var(--status-overdue-text)' }}>*</span>
              </label>
              <input
                id="prod-costPrice"
                name="costPrice"
                type="number"
                min="0"
                step="any"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '10px 14px',
                  fontSize: 'var(--font-size-input)',
                  color: 'var(--color-text-main)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${errors.costPrice ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errors.costPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)', marginTop: '5px' }}>
                  <AlertCircle size={14} />
                  <span>{errors.costPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label
              htmlFor="prod-notes"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-form-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-main)',
                marginBottom: '6px',
              }}
            >
              Internal Notes <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-helper)' }}>(Optional)</span>
            </label>
            <textarea
              id="prod-notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any internal specifications, SLA details, or accounting remarks..."
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 'var(--font-size-input)',
                color: 'var(--color-text-main)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Product Variants Section */}
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--font-size-heading-card)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Product Variants
                </h3>
                <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                  Configure tier editions or add-on upgrades (e.g. Odoo variant with +₹560).
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 'var(--font-size-button)' }}
              >
                <Plus size={15} style={{ color: 'var(--color-primary)' }} />
                <span>Add Variant</span>
              </button>
            </div>

            {errors.variants && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-overdue-text)', fontSize: 'var(--font-size-helper)' }}>
                <AlertCircle size={14} />
                <span>{errors.variants}</span>
              </div>
            )}

            {variants.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: '#FAFCFB',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                No variants configured yet. Click "Add Variant" to create tier editions or add-on options.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {variants.map((variant, index) => (
                  <div
                    key={variant.id || index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 150px 110px 36px',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#FAFCFB',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder="e.g. Odoo Enterprise Edition"
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '6px 10px',
                          fontSize: 'var(--font-size-body)',
                          color: 'var(--color-text-main)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xs)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>+₹</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={variant.additionalPrice}
                          onChange={(e) => handleVariantChange(index, 'additionalPrice', e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '6px 10px',
                            fontSize: 'var(--font-size-body)',
                            color: 'var(--color-text-main)',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-xs)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <select
                        value={variant.status}
                        onChange={(e) => handleVariantChange(index, 'status', e.target.value)}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '6px 10px',
                          fontSize: 'var(--font-size-helper)',
                          color: 'var(--color-text-main)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xs)',
                          outline: 'none',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      title="Remove variant"
                      style={{
                        color: 'var(--status-overdue-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
