import React from 'react';
import {
  X,
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle2,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerPaymentReceiptModal({ isOpen, onClose, payment }) {
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
        className="card-surface printable-receipt-container"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {payment.paymentReference}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon no-print" style={{ color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Amount Box */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#F9FBF9',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Amount Paid
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '4px' }}>
            ₹{(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: '#059669' }}>
            <ShieldCheck size={14} />
            <span>Settled & Reconciled</span>
          </div>
        </div>

        {/* Breakdown Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Invoice Number:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{payment.invoiceNumber}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Payment Date:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>{payment.paymentDate}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Payment Method:</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>{payment.paymentMethod}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Transaction Ref:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--color-secondary)' }}>{payment.referenceNumber || 'N/A'}</span>
          </div>

          {payment.notes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '4px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Notes:</span>
              <span style={{ fontSize: '13px', color: 'var(--color-secondary)', fontStyle: 'italic' }}>"{payment.notes}"</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

