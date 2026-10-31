import React, { useState } from 'react';
import {
  X,
  Repeat,
  Calendar,
  Clock,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService.js';

export default function CustomerSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  customerId,
  onUpdated,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'request'
  const [requestType, setRequestType] = useState(''); // 'Pause' | 'Resume' | 'Cancellation'
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  if (!isOpen || !subscription) return null;

  const handleOpenRequest = (type) => {
    setRequestType(type);
    setReason('');
    setFeedback(null);
    setActiveTab('request');
  };

  const handleSubmitRequest = () => {
    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a reason for this request.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (requestType === 'Pause') {
        subscriptionService.requestPause(subscription.id, customerId, reason.trim());
      } else if (requestType === 'Resume') {
        subscriptionService.requestResume(subscription.id, customerId, reason.trim());
      } else if (requestType === 'Cancellation') {
        subscriptionService.requestCancellation(subscription.id, customerId, reason.trim());
      }

      setFeedback({
        type: 'success',
        message: `Your ${requestType.toLowerCase()} request has been submitted successfully and is pending admin approval.`,
      });
      setIsSubmitting(false);
      onUpdated();
    } catch (err) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Failed to submit request.' });
    }
  };

  const handleWithdrawRequest = () => {
    try {
      subscriptionService.cancelPendingRequest(subscription.id, customerId);
      setFeedback({ type: 'success', message: 'Pending request has been withdrawn.' });
      onUpdated();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#E9F3ED', text: '#087A4B' };
      case 'Paused':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Closed':
        return { bg: '#FDE8E8', text: '#9B1C1C' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const badge = getStatusBadge(subscription.status);

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
          maxWidth: '680px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Subscription Reference
              </span>
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
                {subscription.status}
              </span>
              {subscription.pendingRequest && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                  }}
                >
                  ⏳ {subscription.pendingRequest.type} Request Pending Approval
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {subscription.productName}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {subscription.subscriptionNumber} • Plan: {subscription.planName}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: '#FAFCFA',
            padding: '0 var(--space-5)',
          }}
        >
          <button
            onClick={() => { setActiveTab('overview'); setFeedback(null); }}
            style={{
              padding: '10px 14px',
              borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'overview' ? 'var(--font-weight-semibold)' : 'normal',
              fontSize: '14px',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('history'); setFeedback(null); }}
            style={{
              padding: '10px 14px',
              borderBottom: activeTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'history' ? 'var(--font-weight-semibold)' : 'normal',
              fontSize: '14px',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            Timeline & Activity
          </button>
          <button
            onClick={() => { setActiveTab('request'); setRequestType(subscription.status === 'Paused' ? 'Resume' : 'Pause'); setFeedback(null); }}
            style={{
              padding: '10px 14px',
              borderBottom: activeTab === 'request' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'request' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'request' ? 'var(--font-weight-semibold)' : 'normal',
              fontSize: '14px',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            Manage Subscription
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)' }}>
          {feedback && (
            <div
              style={{
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: feedback.type === 'success' ? '#065F46' : '#991B1B',
                border: feedback.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
              }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Pending Request Alert Callout */}
          {subscription.pendingRequest && activeTab !== 'request' && (
            <div
              style={{
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: '#92400E', fontSize: '14px' }}>
                  Action Pending Approval: {subscription.pendingRequest.type} Request
                </div>
                <div style={{ fontSize: '13px', color: '#B45309', marginTop: '2px' }}>
                  Reason: "{subscription.pendingRequest.reason}" • Submitted: {new Date(subscription.pendingRequest.requestedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={handleWithdrawRequest}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#FFFFFF' }}
              >
                Withdraw Request
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Product & Plan Information */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F9FBF9',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Product</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.productName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Assigned Plan</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.planName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Billing Frequency</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.billingFrequency}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Quantity & Rates</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.quantity || 1} unit(s) @ ₹{(subscription.unitPrice || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Billing Cycle & Dates */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Start Date</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.startDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Scheduled End Date</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                    {subscription.endDate || 'Perpetual'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Next Billing Date</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginTop: '2px' }}>
                    {subscription.nextInvoiceDate || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Total Billing Amount */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-green)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                    Recurring Cycle Amount
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Recurring charge per {subscription.billingFrequency?.toLowerCase() || 'cycle'}
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                  ₹{(subscription.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Full chronological record of lifecycle transitions and customer requests:
              </div>
              {(subscription.activityHistory || []).map((act, idx) => (
                <div
                  key={act.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-green)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '13px', color: 'var(--color-secondary)' }}>
                        {act.title || act.event}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px' }}>
                      By: {act.user || 'System'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F3F4F6',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ℹ️ <strong>Governance Notice:</strong> Customer lifecycle requests do not bypass subscription policy rules. Requests are logged and reviewed by your dedicated operations team.
              </div>

              {/* Action Selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Select Request Action:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    disabled={subscription.status !== 'Active'}
                    onClick={() => setRequestType('Pause')}
                    className={`btn ${requestType === 'Pause' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 8px',
                      opacity: subscription.status !== 'Active' ? 0.5 : 1,
                    }}
                  >
                    <PauseCircle size={18} />
                    <span style={{ fontSize: '12px' }}>Request Pause</span>
                  </button>

                  <button
                    type="button"
                    disabled={subscription.status !== 'Paused'}
                    onClick={() => setRequestType('Resume')}
                    className={`btn ${requestType === 'Resume' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 8px',
                      opacity: subscription.status !== 'Paused' ? 0.5 : 1,
                    }}
                  >
                    <PlayCircle size={18} />
                    <span style={{ fontSize: '12px' }}>Request Resume</span>
                  </button>

                  <button
                    type="button"
                    disabled={subscription.status === 'Closed'}
                    onClick={() => setRequestType('Cancellation')}
                    className={`btn ${requestType === 'Cancellation' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 8px',
                      color: requestType === 'Cancellation' ? '#FFFFFF' : 'var(--color-error)',
                      opacity: subscription.status === 'Closed' ? 0.5 : 1,
                    }}
                  >
                    <XCircle size={18} />
                    <span style={{ fontSize: '12px' }}>Request Cancellation</span>
                  </button>
                </div>
              </div>

              {/* Reason input */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Reason for {requestType || 'action'} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Please describe why you are requesting to ${requestType?.toLowerCase() || 'modify'} this subscription...`}
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !requestType}
                  onClick={handleSubmitRequest}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Submitting...' : `Submit ${requestType || ''} Request`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFCFA',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Need help? Contact support@brightloop.io
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

