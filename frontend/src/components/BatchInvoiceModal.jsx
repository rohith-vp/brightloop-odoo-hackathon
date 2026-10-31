import React, { useState, useEffect } from 'react';
import { X, Layers, CheckSquare, Square, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService.js';
import { invoiceService } from '../services/invoiceService.js';
import { planService } from '../services/planService.js';

export default function BatchInvoiceModal({ isOpen, onClose, onGenerated }) {
  const [billingDate, setBillingDate] = useState('');
  const [eligibleSubs, setEligibleSubs] = useState([]);
  const [selectedSubIds, setSelectedSubIds] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [batchResult, setBatchResult] = useState(null); // When completed: { generated, skipped, failed }

  useEffect(() => {
    if (isOpen) {
      const today = planService.getCurrentDate();
      setBillingDate(today);

      const allSubs = subscriptionService.getSubscriptions();
      // Filter active subscriptions
      const active = allSubs.filter((s) => s.status === 'Active');
      setEligibleSubs(active);
      setSelectedSubIds(active.map((s) => s.id));
      setDiscountCode('');
      setBatchResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedSubIds.length === eligibleSubs.length) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(eligibleSubs.map((s) => s.id));
    }
  };

  const handleToggleSub = (id) => {
    if (selectedSubIds.includes(id)) {
      setSelectedSubIds(selectedSubIds.filter((subId) => subId !== id));
    } else {
      setSelectedSubIds([...selectedSubIds, id]);
    }
  };

  const handleExecuteBatch = () => {
    if (selectedSubIds.length === 0) {
      alert('Please select at least one active subscription to invoice.');
      return;
    }

    const summary = invoiceService.generateBatchInvoices({
      billingDate,
      subscriptionIds: selectedSubIds,
      discountCode: discountCode.trim() || null,
    });

    setBatchResult(summary);
    if (onGenerated) onGenerated();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 25, 24, 0.5)',
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
          maxWidth: '840px',
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
              <Layers size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-heading-section)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                Batch Invoice Generation
              </h2>
              <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                Process recurring invoices in bulk with duplicate prevention and audit logging.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {batchResult ? (
            /* Results View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-green)', borderRadius: 'var(--radius-md)', border: '1px solid #C4E2D2' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                    Generated Invoices
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '4px' }}>
                    {batchResult.generated.length}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: '#92400E' }}>
                    Skipped (With Reason)
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: 'var(--font-weight-bold)', color: '#92400E', marginTop: '4px' }}>
                    {batchResult.skipped.length}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', border: '1px solid #F8B4B4' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-error)' }}>
                    Failed / Errors
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)', marginTop: '4px' }}>
                    {batchResult.failed.length}
                  </div>
                </div>
              </div>

              {/* Generated List */}
              {batchResult.generated.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginBottom: '8px' }}>
                    Successfully Generated Invoices ({batchResult.generated.length})
                  </h4>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Invoice #</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Subscription #</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Customer</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px' }}>Grand Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchResult.generated.map((item) => (
                          <tr key={item.invoiceId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                              {item.invoiceNumber}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                              {item.subscriptionNumber}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--color-secondary)' }}>
                              {item.customerName}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                              ₹{item.grandTotal.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Skipped List */}
              {batchResult.skipped.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', color: '#92400E', marginBottom: '8px' }}>
                    Skipped Subscriptions ({batchResult.skipped.length})
                  </h4>
                  <div style={{ border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFDF5', padding: '10px 14px' }}>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#92400E', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {batchResult.skipped.map((s, idx) => (
                        <li key={idx}>
                          <strong>{s.subscriptionNumber || 'Subscription'}</strong> ({s.customerName}): {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Configure Batch View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                    Target Billing Date
                  </label>
                  <input
                    type="date"
                    value={billingDate}
                    onChange={(e) => setBillingDate(e.target.value)}
                    className="input-field"
                    style={{ height: '42px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                    Apply Batch Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE15"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="input-field"
                    style={{ height: '42px', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Selection Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                    Eligible Active Subscriptions ({eligibleSubs.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
                  >
                    {selectedSubIds.length === eligibleSubs.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '8px 12px', width: '36px', textAlign: 'center' }}></th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Subscription</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Customer</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '13px' }}>Product & Plan</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '13px' }}>Frequency</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligibleSubs.map((sub) => {
                        const isSelected = selectedSubIds.includes(sub.id);
                        return (
                          <tr
                            key={sub.id}
                            onClick={() => handleToggleSub(sub.id)}
                            style={{
                              borderBottom: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(8, 122, 75, 0.04)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                              {sub.subscriptionNumber}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--color-secondary)' }}>
                              {sub.customer?.name}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                              {sub.productName} ({sub.planName})
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <span style={{ padding: '2px 6px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-surface-green)', color: 'var(--color-primary)', fontSize: '12px' }}>
                                {sub.billingFrequency}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                              ₹{(sub.totalPrice || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
          {batchResult ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{ marginLeft: 'auto', padding: '9px 22px' }}
            >
              Done & Close
            </button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBatch}
                className="btn-primary"
                style={{ padding: '9px 22px' }}
              >
                Generate Invoices in Bulk ({selectedSubIds.length})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

