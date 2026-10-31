import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  Receipt,
  CreditCard,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Wallet,
  Shield,
  Layers,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { subscriptionService } from '../../services/subscriptionService.js';
import { invoiceService } from '../../services/invoiceService.js';
import { paymentService } from '../../services/paymentService.js';
import { planService } from '../../services/planService.js';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const userSubs = subscriptionService.getMySubscriptions();
    const userInvs = invoiceService.getMyInvoices();
    const userPays = paymentService.getMyPayments();

    setSubscriptions(userSubs);
    setInvoices(userInvs);
    setPayments(userPays);
  }, [navigate]);

  if (!currentUser) return null;

  // KPI Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const outstandingBalance = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
  const totalInvoicesCount = invoices.length;

  // Determine earliest next billing date
  const nextBillingDates = activeSubs
    .map((s) => s.nextInvoiceDate)
    .filter(Boolean)
    .sort();
  const nextBillingDate = nextBillingDates.length > 0 ? nextBillingDates[0] : 'None scheduled';

  // Recent Invoices (up to 4)
  const recentInvoices = [...invoices].slice(0, 4);

  // Recent Payments (up to 4)
  const recentPayments = [...payments].slice(0, 4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Paid':
        return { bg: '#E9F3ED', text: '#087A4B' };
      case 'Partially Paid':
      case 'Paused':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Overdue':
      case 'Cancelled':
      case 'Closed':
        return { bg: '#FDE8E8', text: '#9B1C1C' };
      case 'Draft':
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner */}
      <div
        className="card-surface"
        style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-white)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-semibold)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-green)',
                color: 'var(--color-primary)',
              }}
            >
              Account Portal
            </span>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
              • ID: {currentUser.customerId || 'Demo Admin'}
            </span>
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-1)',
            }}
          >
            Welcome, {currentUser.name}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Manage your organization's subscriptions, examine tax invoices, and track payment receipts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => navigate('/portal/subscriptions')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Repeat size={16} />
            View Subscriptions
          </button>
          <button
            onClick={() => navigate('/portal/invoices')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Receipt size={16} />
            My Invoices
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Active Subscriptions */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Active Subscriptions
            </span>
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
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '28px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {activeSubs.length}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            {subscriptions.length} total across all statuses
          </div>
        </div>

        {/* Total Invoices */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Total Invoices
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '28px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {totalInvoicesCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Generated billing cycles
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Outstanding Balance
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: outstandingBalance > 0 ? '#FEF2F2' : 'var(--color-surface-green)',
                color: outstandingBalance > 0 ? '#DC2626' : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 'var(--font-weight-semibold)',
                color: outstandingBalance > 0 ? '#DC2626' : 'var(--color-secondary)',
              }}
            >
              ₹{outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            {outstandingBalance > 0 ? 'Pending invoice payment' : 'All accounts settled'}
          </div>
        </div>

        {/* Next Billing Date */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Next Billing Date
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '24px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {nextBillingDate}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Upcoming recurring renewal
          </div>
        </div>
      </div>

      {/* Main Grid: Active Subscriptions & Upcoming Billing Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Active Subscriptions List */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-section-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              Active Subscriptions
            </h2>
            <button
              onClick={() => navigate('/portal/subscriptions')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {activeSubs.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No active subscriptions currently on record.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeSubs.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        {sub.productName}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--color-surface-green)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {sub.billingFrequency}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Plan: {sub.planName} • Ref: {sub.subscriptionNumber}
                    </div>
                    {sub.pendingRequest && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#D97706', fontWeight: 'var(--font-weight-medium)' }}>
                        ⏳ {sub.pendingRequest.type} request pending admin approval
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      ₹{sub.totalPrice?.toLocaleString('en-IN') || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Renews: {sub.nextInvoiceDate || 'Scheduled'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Billing & Account Summary */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--font-size-section-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginBottom: 'var(--space-4)' }}>
            Upcoming Billing & Notices
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-green)',
                border: '1px solid rgba(8, 122, 75, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                <CheckCircle2 size={16} />
                <span>Next Scheduled Billing Cycle</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-main)', margin: 0 }}>
                Your next recurring invoice is scheduled to be generated on <strong>{nextBillingDate}</strong>. Automatic invoices will reflect your active plan rates.
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                <Shield size={16} />
                <span>Account Protection & Inquiries</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Need to pause or update your plan? Customer requests can be submitted anytime via your Subscriptions tab and will be processed by your dedicated account manager.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Recent Invoices */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-section-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              Recent Invoices
            </h2>
            <button
              onClick={() => navigate('/portal/invoices')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No invoices generated yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    <th style={{ padding: '8px 4px' }}>Invoice #</th>
                    <th style={{ padding: '8px 4px' }}>Date</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => {
                    const badge = getStatusBadge(inv.status);
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                        <td style={{ padding: '10px 4px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                          {inv.invoiceNumber}
                        </td>
                        <td style={{ padding: '10px 4px', color: 'var(--color-text-secondary)' }}>
                          {inv.invoiceDate}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                          ₹{inv.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'center' }}>
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
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-section-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              Recent Payments
            </h2>
            <button
              onClick={() => navigate('/portal/payments')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No payments recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    <th style={{ padding: '8px 4px' }}>Payment Ref</th>
                    <th style={{ padding: '8px 4px' }}>Date</th>
                    <th style={{ padding: '8px 4px' }}>Method</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((pay) => (
                    <tr key={pay.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                        {pay.paymentReference}
                      </td>
                      <td style={{ padding: '10px 4px', color: 'var(--color-text-secondary)' }}>
                        {pay.paymentDate}
                      </td>
                      <td style={{ padding: '10px 4px', color: 'var(--color-text-secondary)' }}>
                        {pay.paymentMethod}
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                        ₹{pay.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

