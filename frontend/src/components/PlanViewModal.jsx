import React from 'react';
import { X, Edit, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { planService } from '../services/planService';

export default function PlanViewModal({ isOpen, onClose, plan, onEdit }) {
  if (!isOpen || !plan) return null;

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
          maxHeight: '92vh',
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
              {plan.billingFrequency} Plan
            </span>
            <span
              className={`status-badge ${
                plan.status === 'available' || plan.status === 'active'
                  ? 'success'
                  : plan.status === 'expired'
                  ? 'overdue'
                  : 'pending'
              }`}
            >
              {plan.availabilityStatus || (plan.status.charAt(0).toUpperCase() + plan.status.slice(1))}
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
          {/* Title & Product */}
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
              {plan.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Associated Product:</span>
              <strong style={{ color: 'var(--color-text-main)' }}>{plan.productName}</strong>
            </div>
            {plan.description && (
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {plan.description}
              </p>
            )}
          </div>

          {/* Pricing & Terms Grid */}
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
                backgroundColor: 'var(--color-surface-green)',
                border: '1px solid var(--color-primary)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-primary)', display: 'block', marginBottom: '2px', fontWeight: 'var(--font-weight-medium)' }}>
                Billing Price
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                }}
              >
                {planService.formatCurrency(plan.price)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'block', marginTop: '2px' }}>
                per {plan.billingFrequency.toLowerCase().replace('ly', '')}
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
                Billing Cycle
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-secondary)',
                }}
              >
                {plan.billingFrequency}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                Recurring interval
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
                Min Quantity
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-secondary)',
                }}
              >
                {plan.minQuantity || 1} unit(s)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                Order threshold
              </span>
            </div>
          </div>

          {/* Availability Period */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: '#FAFCFB',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--font-size-helper)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                Availability Window
              </span>
              <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-main)' }}>
                {plan.startDate ? plan.startDate : 'Immediate'}
                {' → '}
                {plan.endDate ? plan.endDate : 'Ongoing (No set expiration)'}
              </span>
            </div>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
          </div>

          {/* Lifecycle Settings */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-heading-card)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Lifecycle Configuration
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAFCFB',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Closure Mode</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.closureMode === 'automatic' ? 'Automatic Closure' : 'Manual Closure'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.closureMode === 'automatic'
                    ? 'Terminates on configured end date'
                    : 'Requires admin or subscriber action'}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAFCFB',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Early Cancellation</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.allowEarlyClosure ? 'Allowed' : 'Disabled'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.allowEarlyClosure
                    ? 'Subscribers can exit mid-term'
                    : 'Fixed contract until maturity'}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAFCFB',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Subscription Pause</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.allowPause ? 'Allowed' : 'Disabled'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.allowPause
                    ? 'Customers can freeze billing periods'
                    : 'Uninterrupted continuity required'}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAFCFB',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Renewal Policy</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  {!plan.lifecycle?.renewalEnabled
                    ? 'Renewal Disabled'
                    : plan.lifecycle?.renewalMode === 'auto'
                    ? 'Automatic Auto-Renew'
                    : 'Manual Renewal Required'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {plan.lifecycle?.renewalEnabled ? 'Dispatches renewal reminder' : 'Single term duration'}
                </div>
              </div>
            </div>
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
              onEdit(plan);
            }}
            className="btn btn-primary"
          >
            <Edit size={16} />
            <span>Edit Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

