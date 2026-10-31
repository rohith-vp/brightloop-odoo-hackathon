import React from 'react';
import {
  X,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Repeat,
} from 'lucide-react';

export default function InvoiceViewModal({
  isOpen,
  onClose,
  invoice,
  onConfirm,
  onCancel,
  onRecordPayment,
}) {
  if (!isOpen || !invoice) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Paid' };
      case 'Partially Paid':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Partially Paid' };
      case 'Confirmed':
        return { bg: '#EBF5FF', text: '#1E40AF', label: 'Confirmed' };
      case 'Draft':
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Draft' };
      case 'Overdue':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Overdue' };
      case 'Cancelled':
        return { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const badge = getStatusBadge(invoice.status);
  const canRecordPayment = invoice.status !== 'Draft' && invoice.status !== 'Cancelled' && (invoice.balanceDue || 0) > 0;

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
          maxWidth: '820px',
          maxHeight: '92vh',
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
              <Receipt size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h2
                  style={{
                    fontSize: 'var(--font-size-heading-section)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  {invoice.invoiceNumber}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--font-size-badge)',
                    fontWeight: 'var(--font-weight-semibold)',
                    backgroundColor: badge.bg,
                    color: badge.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                Tax Invoice & Fulfillment Breakdown
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Metadata Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Customer Box */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Billed To
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '4px' }}>
                {invoice.customer?.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {invoice.customer?.contactPerson && <span>Attn: {invoice.customer.contactPerson}</span>}
                <span>Email: {invoice.customer?.email}</span>
                {invoice.customer?.phone && <span>Phone: {invoice.customer.phone}</span>}
                {invoice.customer?.billingAddress?.street && (
                  <span>
                    Address: {invoice.customer.billingAddress.street}, {invoice.customer.billingAddress.city}
                  </span>
                )}
              </div>
            </div>

            {/* Invoice Timeline & Subscription */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Invoice Details
              </span>
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Invoice Date:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                    {invoice.invoiceDate}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Due Date:</span>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)', color: invoice.status === 'Overdue' ? 'var(--color-error)' : 'var(--color-secondary)' }}>
                    {invoice.dueDate}
                  </span>
                </div>
                {invoice.subscriptionNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Subscription:</span>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                      {invoice.subscriptionNumber}
                    </span>
                  </div>
                )}
                {invoice.billingPeriod && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Billing Period:</span>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                      {invoice.billingPeriod.startDate} → {invoice.billingPeriod.endDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginBottom: '8px' }}>
              Invoiced Subscription Items
            </h4>
            <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>Product</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>Plan</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '13px' }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px' }}>Unit Price (₹)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px' }}>Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                        {item.productName}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        {item.planName}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--color-secondary)' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                        ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        ₹{(item.lineTotal || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Invoice Notes
              </span>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {invoice.notes || 'Automated recurring invoice.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  ₹{(invoice.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {(invoice.discountAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)' }}>
                  <span>Discount {invoice.discountCode ? `(${invoice.discountCode})` : ''}:</span>
                  <span>-₹{(invoice.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>GST ({invoice.taxRate || 18}%):</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  +₹{(invoice.taxAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  Grand Total:
                </span>
                <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  ₹{(invoice.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)' }}>
                <span>Amount Paid:</span>
                <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  ₹{(invoice.amountPaid || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)', color: (invoice.balanceDue || 0) > 0 ? 'var(--color-error)' : 'var(--color-primary)' }}>
                  Balance Due:
                </span>
                <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: (invoice.balanceDue || 0) > 0 ? 'var(--color-error)' : 'var(--color-primary)' }}>
                  ₹{(invoice.balanceDue || 0).toLocaleString('en-IN')}
                </span>
              </div>
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
            backgroundColor: '#FFFFFF',
          }}
        >
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px' }}>
            Close
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {invoice.status === 'Draft' && (
              <>
                <button
                  type="button"
                  onClick={() => onCancel(invoice.id)}
                  className="btn-secondary"
                  style={{ color: 'var(--color-error)' }}
                >
                  Cancel Draft
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(invoice.id)}
                  className="btn-primary"
                >
                  Confirm Invoice
                </button>
              </>
            )}

            {canRecordPayment && (
              <button
                type="button"
                onClick={() => onRecordPayment(invoice)}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CreditCard size={16} /> Record Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

