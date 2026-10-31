import React from 'react';
import {
  X,
  Printer,
  Receipt,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function CustomerInvoiceModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#E9F3ED', text: '#087A4B' };
      case 'Partially Paid':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Overdue':
        return { bg: '#FDE8E8', text: '#9B1C1C' };
      case 'Draft':
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const badge = getStatusBadge(invoice.status);

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
        className="card-surface printable-invoice-container"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Actions (hidden in print) */}
        <div
          className="no-print"
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFCFA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Receipt size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              Tax Invoice {invoice.invoiceNumber}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px' }}
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {/* Top Brand & Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                  }}
                >
                  B
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', letterSpacing: '-0.02em' }}>
                  Brightloop
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Brightloop Cloud Technologies Pvt Ltd<br />
                GSTIN: 27AAACB2201M1Z5<br />
                support@brightloop.io • Mumbai, India
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                TAX INVOICE
              </h1>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: badge.bg,
                    color: badge.text,
                  }}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Billed To:
              </div>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: '15px' }}>
                {invoice.customer?.name || 'Customer Organization'}
              </div>
              {invoice.customer?.contactPerson && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                  Attn: {invoice.customer.contactPerson}
                </div>
              )}
              {invoice.customer?.email && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {invoice.customer.email}
                </div>
              )}
              {invoice.customer?.billingAddress && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {invoice.customer.billingAddress.street}, {invoice.customer.billingAddress.city},{' '}
                  {invoice.customer.billingAddress.state} - {invoice.customer.billingAddress.postalCode}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Invoice Date:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>{invoice.invoiceDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Payment Due Date:</span>
                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: invoice.status === 'Overdue' ? 'var(--color-error)' : 'var(--color-secondary)' }}>
                  {invoice.dueDate}
                </span>
              </div>
              {invoice.subscriptionNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subscription Ref:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{invoice.subscriptionNumber}</span>
                </div>
              )}
              {invoice.billingPeriod && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Billing Period:</span>
                  <span style={{ color: 'var(--color-secondary)' }}>
                    {invoice.billingPeriod.startDate} to {invoice.billingPeriod.endDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#F9FBF9' }}>
                  <th style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                    Description
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    Qty
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                    Unit Price
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                        {item.productName}
                      </div>
                      {item.planName && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          Plan: {item.planName}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                      ₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                      ₹{Number(item.lineTotal || (item.quantity * item.unitPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-6)' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  ₹{(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {(invoice.discountAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-primary)' }}>
                  <span>Concession / Promo:</span>
                  <span>-₹{invoice.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span>GST Tax ({invoice.taxRate || 18}%):</span>
                <span>₹{(invoice.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-secondary)',
                  paddingTop: '6px',
                  borderTop: '2px solid var(--color-border)',
                }}
              >
                <span>Grand Total:</span>
                <span>₹{(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', paddingTop: '4px' }}>
                <span>Amount Paid:</span>
                <span>₹{(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: (invoice.balanceDue || 0) > 0 ? 'var(--color-error)' : 'var(--color-primary)',
                  paddingTop: '6px',
                  borderTop: '1px dashed var(--color-border)',
                }}
              >
                <span>Balance Due:</span>
                <span>₹{(invoice.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: 'var(--space-3)', backgroundColor: '#F9FBF9', borderRadius: 'var(--radius-sm)' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="no-print"
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            backgroundColor: '#FAFCFA',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {/* Print styling overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-invoice-container, .printable-invoice-container * {
            visibility: visible;
          }
          .printable-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

