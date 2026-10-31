import React from 'react';
import { X, Percent, Tag, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DiscountViewModal({ isOpen, onClose, discount, onEdit }) {
  if (!isOpen || !discount) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Active' };
      case 'expired':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Expired' };
      case 'upcoming':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Upcoming' };
      case 'inactive':
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Inactive' };
    }
  };

  const badge = getStatusBadge(discount.status);

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
          maxWidth: '560px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-green)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Percent size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                  {discount.name}
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-semibold)',
                    backgroundColor: badge.bg,
                    color: badge.text,
                    textTransform: 'uppercase',
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontWeight: 'var(--font-weight-bold)' }}>
                CODE: {discount.code}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Value Box */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
            marginBottom: 'var(--space-5)',
          }}
        >
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>
            Concession Rate
          </span>
          <div style={{ fontSize: '28px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '2px' }}>
            {discount.type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} FLAT`}
          </div>
          {discount.description && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {discount.description}
            </p>
          )}
        </div>

        {/* Rules & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Validity Window:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
              {discount.validFrom || 'Immediate'} → {discount.validUntil || 'Ongoing'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Minimum Purchase:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
              {discount.minPurchaseAmount > 0 ? `₹${discount.minPurchaseAmount.toLocaleString('en-IN')}` : 'No minimum'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Usage Count:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
              {discount.usageCount || 0} {discount.maxUsageLimit ? `/ ${discount.maxUsageLimit} used` : 'times used (unlimited)'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Applicability:</span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', textTransform: 'capitalize' }}>
              {discount.applicability.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(discount);
            }}
            className="btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            Edit Campaign
          </button>
          <button type="button" onClick={onClose} className="btn-primary" style={{ padding: '8px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

