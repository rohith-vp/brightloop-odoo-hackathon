import React from 'react';
import {
  X,
  FileText,
  Calendar,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function QuotationViewModal({
  isOpen,
  onClose,
  quotation,
  onEdit,
  onSend,
  onConfirm,
  onCancel,
  onCreateSubscription,
}) {
  if (!isOpen || !quotation) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Confirmed' };
      case 'Sent':
        return { bg: '#EBF5FF', text: '#1E40AF', label: 'Sent' };
      case 'Draft':
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Draft' };
      case 'Cancelled':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Cancelled' };
      case 'Expired':
        return { bg: '#FEF3C7', text: '#92400E', label: 'Expired' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const badge = getStatusBadge(quotation.status);

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
              <FileText size={20} />
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
                  {quotation.quotationNumber}
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
                Commercial Subscription Quotation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)' }}
          >
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
              <span
                style={{
                  fontSize: 'var(--font-size-badge)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Billed To
              </span>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                  marginTop: '4px',
                  marginBottom: '6px',
                }}
              >
                {quotation.customer?.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {quotation.customer?.contactPerson && (
                  <span>Attn: {quotation.customer.contactPerson}</span>
                )}
                <span>Email: {quotation.customer?.email}</span>
                {quotation.customer?.phone && <span>Phone: {quotation.customer.phone}</span>}
                {quotation.customer?.billingAddress?.street && (
                  <span>
                    {quotation.customer.billingAddress.street}, {quotation.customer.billingAddress.city}
                  </span>
                )}
              </div>
            </div>

            {/* Dates & Status Box */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-badge)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Quote Timeline
              </span>
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Quotation Date:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                    {quotation.quotationDate}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Valid Until (Expiry):</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                    {quotation.expiryDate}
                  </span>
                </div>
                {quotation.subscriptionId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Subscription Linked:</span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--color-surface-green)',
                        color: 'var(--color-primary)',
                        fontSize: '12px',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Linked
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-heading-card)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Quoted Items & Plans
            </h4>
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                      Product / Service
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                      Subscription Plan
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 'var(--font-size-table-header)' }}>
                      Cycle
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 'var(--font-size-table-header)' }}>
                      Qty
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>
                      Unit Price
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.lineItems || []).map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                        {item.productName}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        {item.planName || 'Standard Plan'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--color-surface-green)',
                            color: 'var(--color-primary)',
                            fontSize: '12px',
                            fontWeight: 'var(--font-weight-medium)',
                          }}
                        >
                          {item.billingFrequency || 'Monthly'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-secondary)' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                        ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        ₹{(item.lineTotal || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Financial Breakdown & Notes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--font-size-badge)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Special Terms & Notes
              </span>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '6px',
                  lineHeight: 1.5,
                  fontStyle: quotation.notes ? 'normal' : 'italic',
                }}
              >
                {quotation.notes || 'No special terms specified for this quotation.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  ₹{(quotation.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-primary)' }}>
                <span>Discount ({quotation.discountType === 'percentage' ? `${quotation.discountValue}%` : 'Fixed'}):</span>
                <span>-₹{(quotation.discountAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <span>GST ({quotation.taxRate || 18}%):</span>
                <span>+₹{(quotation.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  Grand Total:
                </span>
                <span style={{ fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                  ₹{(quotation.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
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
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 16px' }}>
            Close
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {/* If Draft, allow edit, cancel, confirm */}
            {quotation.status === 'Draft' && (
              <>
                <button
                  type="button"
                  onClick={() => onCancel(quotation.id)}
                  className="btn-secondary"
                  style={{ color: 'var(--color-error)' }}
                >
                  Cancel Quote
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(quotation)}
                  className="btn-secondary"
                >
                  Edit Draft
                </button>
                {onSend && (
                  <button
                    type="button"
                    onClick={() => onSend(quotation.id)}
                    className="btn-secondary"
                    style={{ color: '#1E40AF', borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}
                  >
                    Mark as Sent
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onConfirm(quotation.id)}
                  className="btn-primary"
                >
                  Confirm Quotation
                </button>
              </>
            )}

            {/* If Sent, allow confirm or cancel */}
            {quotation.status === 'Sent' && (
              <>
                <button
                  type="button"
                  onClick={() => onCancel(quotation.id)}
                  className="btn-secondary"
                  style={{ color: 'var(--color-error)' }}
                >
                  Cancel Quote
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(quotation.id)}
                  className="btn-primary"
                >
                  Confirm Quotation
                </button>
              </>
            )}

            {/* If Confirmed, give option to create subscription */}
            {quotation.status === 'Confirmed' && (
              <button
                type="button"
                onClick={() => onCreateSubscription(quotation)}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 2px 8px rgba(8, 122, 75, 0.25)',
                }}
              >
                <span>Create Subscription</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

