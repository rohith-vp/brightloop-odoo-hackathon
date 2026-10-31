import React from 'react';
import { X, Edit } from 'lucide-react';
import { productService } from '../services/productService';

export default function ProductViewModal({ isOpen, onClose, product, onEdit }) {
  if (!isOpen || !product) return null;

  const margin = Number(product.salesPrice) - Number(product.costPrice);
  const marginPercent =
    Number(product.salesPrice) > 0
      ? ((margin / Number(product.salesPrice)) * 100).toFixed(1)
      : 0;

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
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-dropdown)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-surface-green)',
                padding: '3px 9px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {product.type}
            </span>
            <span
              className={`status-badge ${product.status === 'active' ? 'success' : 'pending'}`}
            >
              {product.status === 'active' ? 'Active' : 'Inactive'}
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

        {/* Body Content */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Title */}
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-section)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              {product.name}
            </h2>
            <span style={{ fontSize: 'var(--font-size-helper)', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
              ID: {product.id}
            </span>
          </div>

          {/* Pricing Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-3)',
            }}
          >
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                Sales Price
              </span>
              <span
                style={{
                  fontSize: '19px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-secondary)',
                }}
              >
                {productService.formatCurrency(product.salesPrice)}
              </span>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                Cost Price
              </span>
              <span
                style={{
                  fontSize: '19px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-main)',
                }}
              >
                {productService.formatCurrency(product.costPrice)}
              </span>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: margin >= 0 ? 'var(--color-surface-green)' : 'var(--status-overdue-bg)',
                border: `1px solid ${margin >= 0 ? 'var(--color-primary)' : 'var(--status-overdue-text)'}`,
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-helper)',
                  color: margin >= 0 ? 'var(--color-primary)' : 'var(--status-overdue-text)',
                  display: 'block',
                  marginBottom: '2px',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Margin ({marginPercent}%)
              </span>
              <span
                style={{
                  fontSize: '19px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: margin >= 0 ? 'var(--color-primary)' : 'var(--status-overdue-text)',
                }}
              >
                {productService.formatCurrency(margin)}
              </span>
            </div>
          </div>

          {/* Internal Notes */}
          {product.notes && (
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: '#FAFCFB',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-helper)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Internal Notes
              </span>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                {product.notes}
              </p>
            </div>
          )}

          {/* Variants Breakdown */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--font-size-heading-card)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                Configured Variants ({product.variants?.length || 0})
              </h3>
            </div>

            {!product.variants || product.variants.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: '#FAFCFB',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                }}
              >
                No special variants configured for this product.
              </div>
            ) : (
              <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <table className="fintech-table">
                  <thead>
                    <tr>
                      <th>Variant Name</th>
                      <th>Additional Price</th>
                      <th>Total Effective Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => {
                      const totalEffective = Number(product.salesPrice) + Number(v.additionalPrice);
                      return (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {v.name}
                          </td>
                          <td style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                            +{productService.formatCurrency(v.additionalPrice)}
                          </td>
                          <td style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                            {productService.formatCurrency(totalEffective)}
                          </td>
                          <td>
                            <span className={`status-badge ${v.status === 'active' ? 'success' : 'pending'}`}>
                              {v.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FAFCFB',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="btn btn-primary"
          >
            <Edit size={16} />
            <span>Edit Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
