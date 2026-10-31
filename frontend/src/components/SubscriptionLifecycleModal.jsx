import React, { useState } from 'react';
import { AlertTriangle, X, Play, Pause, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

export default function SubscriptionLifecycleModal({
  isOpen,
  onClose,
  actionType, // 'pause' | 'close' | 'early_close' | 'renew' | 'activate' | 'confirm'
  subscription,
  onConfirmAction,
}) {
  const [reason, setReason] = useState('');
  const [renewMonths, setRenewMonths] = useState(12);

  if (!isOpen || !subscription) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case 'confirm':
        return {
          title: 'Confirm Subscription Contract',
          description: `Are you sure you want to confirm subscription ${subscription.subscriptionNumber}? This will mark contractual terms as accepted and ready for activation.`,
          icon: CheckCircle,
          iconColor: 'var(--color-primary)',
          confirmText: 'Confirm Contract',
          confirmBtnClass: 'btn-primary',
          requiresReason: false,
        };
      case 'activate':
        return {
          title: 'Activate Subscription',
          description: `Activate ${subscription.subscriptionNumber} for ${subscription.customer?.name}. This will begin the live recurring billing schedule and provision service entitlements.`,
          icon: Play,
          iconColor: 'var(--color-primary)',
          confirmText: 'Activate Subscription',
          confirmBtnClass: 'btn-primary',
          requiresReason: false,
        };
      case 'pause':
        return {
          title: 'Pause Active Subscription',
          description: `Temporarily pause subscription ${subscription.subscriptionNumber}. Service access and automated recurring invoicing will be placed on hold until resumed.`,
          icon: Pause,
          iconColor: '#D97706',
          confirmText: 'Pause Subscription',
          confirmBtnClass: 'btn-secondary',
          requiresReason: true,
          reasonPlaceholder: 'e.g. Customer requested temporary 30-day freeze...',
        };
      case 'resume':
        return {
          title: 'Resume Subscription',
          description: `Restore service access and reinstate recurring invoicing for ${subscription.subscriptionNumber}.`,
          icon: Play,
          iconColor: 'var(--color-primary)',
          confirmText: 'Resume Active Service',
          confirmBtnClass: 'btn-primary',
          requiresReason: false,
        };
      case 'renew':
        return {
          title: 'Renew Subscription Period',
          description: `Renew subscription ${subscription.subscriptionNumber} and calculate a new contract period based on the billing frequency (${subscription.billingFrequency}).`,
          icon: RefreshCw,
          iconColor: 'var(--color-primary)',
          confirmText: 'Execute Renewal',
          confirmBtnClass: 'btn-primary',
          isRenew: true,
        };
      case 'early_close':
        return {
          title: 'Early Contract Closure',
          description: `Terminate subscription ${subscription.subscriptionNumber} prior to scheduled end date (${subscription.endDate}). Active provisioning will cease immediately.`,
          icon: XCircle,
          iconColor: 'var(--color-error)',
          confirmText: 'Close Subscription Early',
          confirmBtnClass: 'btn-primary',
          requiresReason: true,
          isDanger: true,
          reasonPlaceholder: 'Specify business or customer reason for early termination...',
        };
      case 'close':
      default:
        return {
          title: 'Close Subscription',
          description: `Formally close subscription ${subscription.subscriptionNumber}. This will conclude the recurring contract cycle.`,
          icon: XCircle,
          iconColor: 'var(--color-error)',
          confirmText: 'Confirm Closure',
          confirmBtnClass: 'btn-primary',
          requiresReason: true,
          isDanger: true,
          reasonPlaceholder: 'Reason for closure...',
        };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirmAction({
      actionType,
      reason: reason.trim() || undefined,
      renewMonths: Number(renewMonths) || 12,
    });
    setReason('');
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
        zIndex: 1100,
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: config.isDanger ? '#FDE8E8' : 'var(--color-surface-green)',
              color: config.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--font-size-heading-card)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {config.title}
            </h3>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              {config.description}
            </p>
          </div>
        </div>

        {config.isRenew && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
              Renewal Duration (Months)
            </label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(Number(e.target.value))}
              className="input-field"
              style={{ height: '42px', fontSize: '15px' }}
            >
              <option value={1}>1 Month Extension</option>
              <option value={3}>3 Months (Quarterly)</option>
              <option value={6}>6 Months (Half-Yearly)</option>
              <option value={12}>12 Months (1 Full Year)</option>
              <option value={24}>24 Months (2 Years)</option>
            </select>
          </div>
        )}

        {config.requiresReason && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
              Action Justification / Note <span style={{ color: 'var(--color-text-secondary)' }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.reasonPlaceholder}
              className="input-field"
              style={{ height: '42px', fontSize: '15px' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={config.confirmBtnClass}
            style={{
              padding: '9px 20px',
              backgroundColor: config.isDanger ? 'var(--color-error)' : undefined,
              borderColor: config.isDanger ? 'var(--color-error)' : undefined,
            }}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

