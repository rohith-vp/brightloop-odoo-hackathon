import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { subscriptionService } from '../../services/subscriptionService.js';
import CustomerSubscriptionModal from '../../components/CustomerSubscriptionModal.jsx';

export default function CustomerSubscriptionsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const loadData = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const list = subscriptionService.getMySubscriptions();
    setSubscriptions(list);

    if (selectedSubscription) {
      try {
        const refreshed = subscriptionService.getMySubscriptionById(selectedSubscription.id);
        setSelectedSubscription(refreshed);
      } catch {
        setSelectedSubscription(null);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  if (!currentUser) return null;

  const customerId = currentUser.customerId || 'cust_1';

  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(term) ||
      (sub.productName && sub.productName.toLowerCase().includes(term)) ||
      (sub.planName && sub.planName.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              letterSpacing: '-0.02em',
            }}
          >
            My Subscriptions
          </h1>
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
            {subscriptions.length} Total
          </span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Review active products, recurring renewal plans, and submit lifecycle pause or cancellation requests.
        </p>
      </div>

      {/* Search and Filter Toolbar */}
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
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by subscription #, product, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-focus"
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3) var(--space-2) 38px',
              fontSize: 'var(--font-size-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-table-content)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
              color: 'var(--color-secondary)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FBFDFB' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Subscription #
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Product & Plan
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Frequency
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Start Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Next Billing
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Amount
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Repeat size={32} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        No subscriptions found
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'Try adjusting your search criteria.'
                          : 'You currently have no active or historical subscription contracts on file.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const badge = getStatusBadge(sub.status);
                  return (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', fontSize: 'var(--font-size-table-content)' }}>
                          {sub.subscriptionNumber}
                        </div>
                        {sub.quotationNumber && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Quote: {sub.quotationNumber}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                          {sub.productName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          Plan: {sub.planName}
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '12px',
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                          }}
                        >
                          {sub.billingFrequency}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-text-secondary)' }}>
                        {sub.startDate}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-secondary)' }}>
                        {sub.nextInvoiceDate || 'Perpetual'}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', textAlign: 'right' }}>
                        ₹{(sub.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-badge)',
                              fontWeight: 'var(--font-weight-medium)',
                              backgroundColor: badge.bg,
                              color: badge.text,
                            }}
                          >
                            {sub.status}
                          </span>
                          {sub.pendingRequest && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: '#FEF3C7',
                                color: '#D97706',
                                fontWeight: 'var(--font-weight-medium)',
                              }}
                            >
                              ⏳ {sub.pendingRequest.type} Pending
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSubscription(sub)}
                          className="btn btn-secondary"
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Request Modal */}
      <CustomerSubscriptionModal
        isOpen={!!selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        subscription={selectedSubscription}
        customerId={customerId}
        onUpdated={loadData}
      />
    </div>
  );
}

