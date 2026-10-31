import React from 'react';
import {
  X,
  Repeat,
  Calendar,
  Building2,
  Mail,
  Phone,
  Clock,
  Play,
  Pause,
  RefreshCw,
  XCircle,
  CheckCircle,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onTriggerLifecycle, // opens lifecycle confirmation modal
}) {
  if (!isOpen || !subscription) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Active' };
      case 'Confirmed':
        return { bg: '#EBF5FF', text: '#1E40AF', label: 'Confirmed' };
      case 'Paused':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Paused' };
      case 'Closed':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Closed' };
      case 'Draft':
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Draft' };
      case 'Quotation':
        return { bg: '#EDE9FE', text: '#6D28D9', label: 'Quotation' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const badge = getStatusBadge(subscription.status);

  // Status transition validity check
  const canConfirm = subscription.status === 'Draft' || subscription.status === 'Quotation';
  const canActivate = subscription.status === 'Confirmed';
  const canPause = subscription.status === 'Active';
  const canResume = subscription.status === 'Paused';
  const canRenew = subscription.status === 'Active' || subscription.status === 'Paused' || subscription.status === 'Closed';
  const canClose = subscription.status === 'Active' || subscription.status === 'Paused';

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
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          overflowX: 'hidden',
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
              <Repeat size={20} />
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
                  {subscription.subscriptionNumber}
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
                Recurring Subscription Contract Details
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
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Customer Information */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                <span
                  style={{
                    fontSize: 'var(--font-size-badge)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Customer Account
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                {subscription.customer?.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {subscription.customer?.contactPerson && (
                  <span>Contact: {subscription.customer.contactPerson}</span>
                )}
                <span>Email: {subscription.customer?.email}</span>
                {subscription.customer?.phone && <span>Phone: {subscription.customer.phone}</span>}
                {subscription.customer?.billingAddress?.street && (
                  <span>
                    Address: {subscription.customer.billingAddress.street}, {subscription.customer.billingAddress.city}
                  </span>
                )}
              </div>
            </div>

            {/* Plan & Pricing */}
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                <Repeat size={16} style={{ color: 'var(--color-primary)' }} />
                <span
                  style={{
                    fontSize: 'var(--font-size-badge)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Entitlement & Pricing
                </span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                {subscription.productName}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', marginTop: '2px' }}>
                Plan: {subscription.planName}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {subscription.quantity} Unit(s) × ₹{(subscription.unitPrice || 0).toLocaleString('en-IN')} / {subscription.billingFrequency}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                  ₹{(subscription.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule & Metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Start Date
              </span>
              <div style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                {subscription.startDate}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                End Date (Scheduled Expiry)
              </span>
              <div style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                {subscription.endDate}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Billing Frequency
              </span>
              <div style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                {subscription.billingFrequency}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Next Invoice Date
              </span>
              <div style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', marginTop: '2px' }}>
                {subscription.nextInvoiceDate || 'Scheduled on renewal'}
              </div>
            </div>
          </div>

          {/* Activity History Timeline */}
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-heading-card)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                marginBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={18} style={{ color: 'var(--color-primary)' }} /> Activity History Timeline
            </h4>

            <div
              style={{
                padding: 'var(--space-4) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {(subscription.activityHistory || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor:
                        item.event === 'Activated' || item.event === 'Renewed' || item.event === 'Resumed'
                          ? 'var(--color-surface-green)'
                          : item.event === 'Closed'
                          ? '#FDE8E8'
                          : item.event === 'Paused'
                          ? '#FEF3C7'
                          : 'var(--color-surface-white)',
                      color:
                        item.event === 'Activated' || item.event === 'Renewed' || item.event === 'Resumed'
                          ? 'var(--color-primary)'
                          : item.event === 'Closed'
                          ? 'var(--color-error)'
                          : item.event === 'Paused'
                          ? '#D97706'
                          : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Check size={14} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {item.description}
                    </p>
                    {item.user && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        By {item.user}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Lifecycle Actions */}
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

          {/* Lifecycle Action Triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Confirm */}
            {canConfirm && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('confirm', subscription)}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={16} /> Confirm Terms
              </button>
            )}

            {/* Activate */}
            {canActivate && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('activate', subscription)}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={16} /> Activate Service
              </button>
            )}

            {/* Pause */}
            {canPause && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('pause', subscription)}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D97706' }}
              >
                <Pause size={16} /> Pause Subscription
              </button>
            )}

            {/* Resume */}
            {canResume && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('resume', subscription)}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={16} /> Resume Service
              </button>
            )}

            {/* Renew */}
            {canRenew && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('renew', subscription)}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} /> Renew Contract
              </button>
            )}

            {/* Close / Early Closure */}
            {canClose && (
              <button
                type="button"
                onClick={() => onTriggerLifecycle('early_close', subscription)}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)' }}
              >
                <XCircle size={16} /> Close Subscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

