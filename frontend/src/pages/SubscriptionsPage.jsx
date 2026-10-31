import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  XCircle,
  Eye,
  Trash2,
  TrendingUp,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { subscriptionService, SUBSCRIPTION_STATUSES } from '../services/subscriptionService';
import { productService } from '../services/productService';
import { BILLING_FREQUENCIES } from '../services/planService';
import SubscriptionModal from '../components/SubscriptionModal';
import SubscriptionDetailsModal from '../components/SubscriptionDetailsModal';
import SubscriptionLifecycleModal from '../components/SubscriptionLifecycleModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSubscription, setViewingSubscription] = useState(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  // Lifecycle Modal state
  const [lifecycleModalState, setLifecycleModalState] = useState({
    isOpen: false,
    actionType: '',
    subscription: null,
  });

  const loadSubscriptions = () => {
    // This method automatically executes checkAndApplyAutoClosure for expired contracts
    const list = subscriptionService.getSubscriptions();
    setSubscriptions(list);
    setProducts(productService.getProducts());
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Filtered list
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.customer?.name && sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.productName && sub.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.planName && sub.planName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'ALL' || sub.billingFrequency === frequencyFilter;
    const matchesProduct = productFilter === 'ALL' || sub.productId === productFilter;

    return matchesSearch && matchesStatus && matchesFrequency && matchesProduct;
  });

  // KPI Calculations
  const totalCount = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'Active').length;
  const activeMRR = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => {
      // Normalize monthly recurring rate
      let monthlyRate = s.totalPrice || 0;
      if (s.billingFrequency === 'Yearly') monthlyRate = (s.totalPrice || 0) / 12;
      else if (s.billingFrequency === 'Weekly') monthlyRate = (s.totalPrice || 0) * 4.33;
      else if (s.billingFrequency === 'Daily') monthlyRate = (s.totalPrice || 0) * 30;
      return acc + monthlyRate;
    }, 0);

  const pausedCount = subscriptions.filter((s) => s.status === 'Paused').length;
  const closedCount = subscriptions.filter((s) => s.status === 'Closed').length;

  // Actions
  const handleSaveSubscription = (payload) => {
    try {
      subscriptionService.createSubscription(payload);
      loadSubscriptions();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenLifecycleModal = (actionType, subscription) => {
    setLifecycleModalState({
      isOpen: true,
      actionType,
      subscription,
    });
  };

  const handleExecuteLifecycleAction = ({ actionType, reason, renewMonths }) => {
    const sub = lifecycleModalState.subscription;
    if (!sub) return;

    try {
      let updated = null;
      switch (actionType) {
        case 'confirm':
          updated = subscriptionService.confirmSubscription(sub.id);
          break;
        case 'activate':
          updated = subscriptionService.activateSubscription(sub.id);
          break;
        case 'pause':
          updated = subscriptionService.pauseSubscription(sub.id, reason);
          break;
        case 'resume':
          updated = subscriptionService.resumeSubscription(sub.id);
          break;
        case 'renew':
          updated = subscriptionService.renewSubscription(sub.id, renewMonths);
          break;
        case 'early_close':
          updated = subscriptionService.closeSubscription(sub.id, true, reason);
          break;
        case 'close':
          updated = subscriptionService.closeSubscription(sub.id, false, reason);
          break;
        default:
          break;
      }

      loadSubscriptions();
      setLifecycleModalState({ isOpen: false, actionType: '', subscription: null });

      // Refresh currently open details modal if applicable
      if (viewingSubscription && viewingSubscription.id === sub.id) {
        setViewingSubscription(subscriptionService.getSubscriptionById(sub.id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubscription = () => {
    if (subscriptionToDelete) {
      try {
        subscriptionService.deleteSubscription(subscriptionToDelete.id);
        loadSubscriptions();
        setSubscriptionToDelete(null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              letterSpacing: '-0.02em',
            }}
          >
            Subscriptions
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
            }}
          >
            Manage active recurring customer contracts, lifecycle workflows, automatic renewals, and churn prevention.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '10px 18px',
            fontSize: 'var(--font-size-button)',
          }}
        >
          <Plus size={18} />
          <span>Create Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Active Subscriptions
            </span>
            <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {activeCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Est. Monthly Recurring (MRR)
            </span>
            <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '8px' }}>
            ₹{Math.round(activeMRR).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Paused Contracts
            </span>
            <Pause size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {pausedCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Closed / Expired
            </span>
            <XCircle size={18} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {closedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-surface"
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', flex: 1, minWidth: '280px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="Search by sub number, customer, plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px', height: '42px', fontSize: 'var(--font-size-input)' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: 'var(--font-size-input)' }}
            >
              <option value="ALL">All Statuses</option>
              {SUBSCRIPTION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Frequency Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: 'var(--font-size-input)' }}
            >
              <option value="ALL">All Frequencies</option>
              {BILLING_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: 'var(--font-size-input)' }}
            >
              <option value="ALL">All Products</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div
        className="card-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {filteredSubscriptions.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-12) var(--space-4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Repeat size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-heading-card)', color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>
              No subscriptions found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', maxWidth: '420px' }}>
              {searchTerm || statusFilter !== 'ALL' || frequencyFilter !== 'ALL' || productFilter !== 'ALL'
                ? 'Try adjusting your search query or filter selections.'
                : 'Get started by creating your first subscription contract.'}
            </p>
            {(!searchTerm && statusFilter === 'ALL' && frequencyFilter === 'ALL' && productFilter === 'ALL') && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
                style={{ marginTop: 'var(--space-2)' }}
              >
                Create Subscription
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Sub #
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Customer
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Product / Plan
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Start Date
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    End Date
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 'var(--font-size-table-header)' }}>
                    Cycle
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Next Invoice
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>
                    Total (₹)
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 'var(--font-size-table-header)' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const badge = getStatusBadge(sub.status);
                  const isDraft = sub.status === 'Draft';
                  const isConfirmed = sub.status === 'Confirmed';
                  const isActive = sub.status === 'Active';
                  const isPaused = sub.status === 'Paused';

                  return (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-background)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Subscription Number */}
                      <td style={{ padding: '14px 18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{sub.subscriptionNumber}</span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                          {sub.customer?.name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {sub.customer?.email}
                        </div>
                      </td>

                      {/* Product / Plan */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                          {sub.productName}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                          {sub.planName} (×{sub.quantity})
                        </div>
                      </td>

                      {/* Start Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {sub.startDate}
                      </td>

                      {/* End Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {sub.endDate}
                      </td>

                      {/* Billing Cycle */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--color-surface-green)',
                            color: 'var(--color-primary)',
                            fontSize: '12px',
                            fontWeight: 'var(--font-weight-medium)',
                          }}
                        >
                          {sub.billingFrequency}
                        </span>
                      </td>

                      {/* Next Invoice Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {sub.status === 'Active' ? sub.nextInvoiceDate : '—'}
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: '15px' }}>
                        ₹{(sub.totalPrice || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 10px',
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
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View Details */}
                          <button
                            onClick={() => setViewingSubscription(sub)}
                            className="btn-icon"
                            title="View Subscription Details & Activity"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={17} />
                          </button>

                          {/* Quick Lifecycle Trigger depending on state */}
                          {isConfirmed && (
                            <button
                              onClick={() => handleOpenLifecycleModal('activate', sub)}
                              className="btn-icon"
                              title="Activate Subscription"
                              style={{ padding: '6px', color: 'var(--color-primary)' }}
                            >
                              <Play size={17} />
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => handleOpenLifecycleModal('pause', sub)}
                              className="btn-icon"
                              title="Pause Subscription"
                              style={{ padding: '6px', color: '#D97706' }}
                            >
                              <Pause size={17} />
                            </button>
                          )}

                          {isPaused && (
                            <button
                              onClick={() => handleOpenLifecycleModal('resume', sub)}
                              className="btn-icon"
                              title="Resume Subscription"
                              style={{ padding: '6px', color: 'var(--color-primary)' }}
                            >
                              <Play size={17} />
                            </button>
                          )}

                          {/* Quick Renew (Active, Paused, or Closed) */}
                          {(isActive || isPaused || sub.status === 'Closed') && (
                            <button
                              onClick={() => handleOpenLifecycleModal('renew', sub)}
                              className="btn-icon"
                              title="Renew Contract"
                              style={{ padding: '6px' }}
                            >
                              <RefreshCw size={17} />
                            </button>
                          )}

                          {/* Delete if Draft */}
                          {isDraft && (
                            <button
                              onClick={() => setSubscriptionToDelete(sub)}
                              className="btn-icon"
                              title="Delete Draft"
                              style={{ padding: '6px', color: 'var(--color-error)' }}
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveSubscription}
      />

      <SubscriptionDetailsModal
        isOpen={!!viewingSubscription}
        onClose={() => setViewingSubscription(null)}
        subscription={viewingSubscription}
        onTriggerLifecycle={(actionType, sub) => {
          handleOpenLifecycleModal(actionType, sub);
        }}
      />

      <SubscriptionLifecycleModal
        isOpen={lifecycleModalState.isOpen}
        onClose={() => setLifecycleModalState({ isOpen: false, actionType: '', subscription: null })}
        actionType={lifecycleModalState.actionType}
        subscription={lifecycleModalState.subscription}
        onConfirmAction={handleExecuteLifecycleAction}
      />

      <DeleteConfirmModal
        isOpen={!!subscriptionToDelete}
        onClose={() => setSubscriptionToDelete(null)}
        onConfirm={handleDeleteSubscription}
        itemName={subscriptionToDelete ? `${subscriptionToDelete.subscriptionNumber} (${subscriptionToDelete.customer?.name})` : ''}
      />
    </div>
  );
}

