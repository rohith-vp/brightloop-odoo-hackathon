import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  XCircle,
  Calendar,
} from 'lucide-react';
import { quotationService, QUOTATION_STATUSES } from '../services/quotationService';
import QuotationModal from '../components/QuotationModal';
import QuotationViewModal from '../components/QuotationViewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SubscriptionModal from '../components/SubscriptionModal';
import { subscriptionService } from '../services/subscriptionService';

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [quotationToDelete, setQuotationToDelete] = useState(null);

  // Convert to subscription flow
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [quotationForSub, setQuotationForSub] = useState(null);

  const loadQuotations = () => {
    const list = quotationService.getQuotations();
    setQuotations(list);
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  // Filtered list
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customer?.name && q.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.customer?.contactPerson && q.customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

    const matchesDate = !dateFilter || q.quotationDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // KPI Calculations
  const totalCount = quotations.length;
  const confirmedCount = quotations.filter((q) => q.status === 'Confirmed').length;
  const totalConfirmedValue = quotations
    .filter((q) => q.status === 'Confirmed')
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const draftCount = quotations.filter((q) => q.status === 'Draft').length;
  const expiredCount = quotations.filter((q) => q.status === 'Expired').length;

  // Actions
  const handleCreateOrUpdateQuotation = (data) => {
    try {
      if (quotationToEdit) {
        quotationService.updateQuotation(quotationToEdit.id, data);
      } else {
        quotationService.createQuotation(data);
      }
      loadQuotations();
      setIsCreateModalOpen(false);
      setQuotationToEdit(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendQuotation = (id) => {
    try {
      quotationService.sendQuotation(id);
      loadQuotations();
      if (viewingQuotation && viewingQuotation.id === id) {
        setViewingQuotation(quotationService.getQuotationById(id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmQuotation = (id) => {
    quotationService.confirmQuotation(id);
    loadQuotations();
    if (viewingQuotation && viewingQuotation.id === id) {
      setViewingQuotation(quotationService.getQuotationById(id));
    }
  };

  const handleCancelQuotation = (id) => {
    if (window.confirm('Are you sure you want to cancel this quotation?')) {
      quotationService.cancelQuotation(id);
      loadQuotations();
      if (viewingQuotation && viewingQuotation.id === id) {
        setViewingQuotation(quotationService.getQuotationById(id));
      }
    }
  };

  const handleDeleteQuotation = () => {
    if (quotationToDelete) {
      try {
        quotationService.deleteQuotation(quotationToDelete.id);
        loadQuotations();
        setQuotationToDelete(null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreateSubscriptionFromQuote = (quotation) => {
    setViewingQuotation(null);
    setQuotationForSub(quotation);
    setIsSubModalOpen(true);
  };

  const handleSaveSubscription = (payload) => {
    try {
      subscriptionService.createSubscription(payload);
      loadQuotations();
      setIsSubModalOpen(false);
      setQuotationForSub(null);
      // Navigate to subscriptions page to view result
      navigate('/subscriptions');
    } catch (err) {
      alert(err.message);
    }
  };

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
            Quotations
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
            }}
          >
            Create, price, and dispatch commercial quotes, with one-click conversion to active subscriptions.
          </p>
        </div>

        <button
          onClick={() => {
            setQuotationToEdit(null);
            setIsCreateModalOpen(true);
          }}
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
          <span>Create Quotation</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
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
              Total Quotations
            </span>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {totalCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Confirmed Value
            </span>
            <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '8px' }}>
            ₹{totalConfirmedValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Drafts in Progress
            </span>
            <Clock size={18} style={{ color: '#4B5563' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {draftCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Expired Quotations
            </span>
            <AlertCircle size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            {expiredCount}
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
              placeholder="Search by quote number, customer name, contact..."
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
              {QUOTATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ minWidth: '160px' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: '14px' }}
              title="Filter by Quotation Date"
            />
          </div>

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="btn-secondary"
              style={{ height: '42px', padding: '0 12px', fontSize: '13px' }}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <div
        className="card-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {filteredQuotations.length === 0 ? (
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
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-heading-card)', color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>
              No quotations found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', maxWidth: '420px' }}>
              {searchTerm || statusFilter !== 'ALL' || dateFilter
                ? 'Try adjusting your search filters or quotation date parameters.'
                : 'Get started by creating your first commercial quotation.'}
            </p>
            {(!searchTerm && statusFilter === 'ALL' && !dateFilter) && (
              <button
                onClick={() => {
                  setQuotationToEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="btn-primary"
                style={{ marginTop: 'var(--space-2)' }}
              >
                Create Quotation
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Quotation #
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Customer
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Quote Date
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>
                    Expiry Date
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>
                    Total Amount
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
                {filteredQuotations.map((quote) => {
                  const badge = getStatusBadge(quote.status);
                  const isDraft = quote.status === 'Draft';
                  const isConfirmed = quote.status === 'Confirmed';
                  const hasSub = !!quote.subscriptionId;

                  return (
                    <tr
                      key={quote.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-background)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Quotation Number */}
                      <td style={{ padding: '14px 18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{quote.quotationNumber}</span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                          {quote.customer?.name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {quote.customer?.contactPerson} ({quote.customer?.email})
                        </div>
                      </td>

                      {/* Quotation Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {quote.quotationDate}
                      </td>

                      {/* Expiry Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {quote.expiryDate}
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: '15px' }}>
                        ₹{quote.grandTotal.toLocaleString('en-IN')}
                      </td>

                      {/* Status Badge */}
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {/* View Action */}
                          <button
                            onClick={() => setViewingQuotation(quote)}
                            className="btn-icon"
                            title="View Quotation"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={17} />
                          </button>

                          {/* Edit Action (Draft only) */}
                          {isDraft && (
                            <button
                              onClick={() => {
                                setQuotationToEdit(quote);
                                setIsCreateModalOpen(true);
                              }}
                              className="btn-icon"
                              title="Edit Draft"
                              style={{ padding: '6px' }}
                            >
                              <Edit2 size={17} />
                            </button>
                          )}

                          {/* Convert to Subscription if Confirmed & not yet linked */}
                          {isConfirmed && !hasSub && (
                            <button
                              onClick={() => handleCreateSubscriptionFromQuote(quote)}
                              className="btn-secondary"
                              title="Create Subscription from this quote"
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                                backgroundColor: 'var(--color-surface-green)',
                              }}
                            >
                              <span>Convert</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {/* Delete Draft */}
                          {isDraft && (
                            <button
                              onClick={() => setQuotationToDelete(quote)}
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
      <QuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setQuotationToEdit(null);
        }}
        onSave={handleCreateOrUpdateQuotation}
        quotationToEdit={quotationToEdit}
      />

      <QuotationViewModal
        isOpen={!!viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        quotation={viewingQuotation}
        onEdit={(quote) => {
          setViewingQuotation(null);
          setQuotationToEdit(quote);
          setIsCreateModalOpen(true);
        }}
        onSend={handleSendQuotation}
        onConfirm={handleConfirmQuotation}
        onCancel={handleCancelQuotation}
        onCreateSubscription={handleCreateSubscriptionFromQuote}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => {
          setIsSubModalOpen(false);
          setQuotationForSub(null);
        }}
        onSave={handleSaveSubscription}
        initialQuotation={quotationForSub}
      />

      <DeleteConfirmModal
        isOpen={!!quotationToDelete}
        onClose={() => setQuotationToDelete(null)}
        onConfirm={handleDeleteQuotation}
        itemName={quotationToDelete ? `${quotationToDelete.quotationNumber} (${quotationToDelete.customer?.name})` : ''}
      />
    </div>
  );
}

