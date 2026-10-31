import React from 'react';
import { X, CreditCard, Building2, Receipt, Calendar, CheckCircle2 } from 'lucide-react';

export default function PaymentViewModal({ isOpen, onClose, payment }) {
  if (!isOpen || !payment) return null;

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
          maxWidth: '540px',
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
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-green)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                Payment Receipt
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {payment.paymentReference}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Amount Box */}
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
            Total Settlement Received
          </span>
          <div style={{ fontSize: '28px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '4px' }}>
            ₹{(payment.amount || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Customer:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
              {payment.customerName}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Invoice Reference:</span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
              {payment.invoiceNumber}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Payment Date:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
              {payment.paymentDate}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Payment Method:</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-surface-green)',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {payment.paymentMethod}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Transaction / UTR:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--color-secondary)' }}>
              {payment.referenceNumber || 'N/A'}
            </span>
          </div>

          {payment.notes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Notes:</span>
              <p style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '13px' }}>{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn-primary" style={{ padding: '8px 20px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

