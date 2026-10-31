import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Layers,
  Search,
  Filter,
  CreditCard,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  XCircle,
  Calendar,
} from 'lucide-react';
import { invoiceService, INVOICE_STATUSES } from '../services/invoiceService.js';
import { customerService } from '../services/customerService.js';
import InvoiceModal from '../components/InvoiceModal.jsx';
import BatchInvoiceModal from '../components/BatchInvoiceModal.jsx';
import InvoiceViewModal from '../components/InvoiceViewModal.jsx';
import PaymentModal from '../components/PaymentModal.jsx';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null); // when recording payment

  const loadInvoices = () => {
    const list = invoiceService.getInvoices();
    setInvoices(list);
    setCustomers(customerService.getCustomers());
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.subscriptionNumber && inv.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesCustomer = customerFilter === 'ALL' || inv.customerId === customerFilter || inv.customer?.id === customerFilter;
    const matchesDate = !dateFilter || inv.invoiceDate === dateFilter;

    return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
  });

  // KPI Calculations
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.balanceDue || 0), 0);
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const handleConfirmInvoice = (id) => {
    try {
      invoiceService.confirmInvoice(id);
      loadInvoices();
      if (viewingInvoice && viewingInvoice.id === id) {
        setViewingInvoice(invoiceService.getInvoiceById(id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelInvoice = (id) => {
    if (window.confirm('Are you sure you want to cancel this draft invoice?')) {
      try {
        invoiceService.cancelInvoice(id);
        loadInvoices();
        if (viewingInvoice && viewingInvoice.id === id) {
          setViewingInvoice(invoiceService.getInvoiceById(id));
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleOpenPaymentFromInvoice = (inv) => {
    setViewingInvoice(null);
    setPaymentInvoice(inv);
  };

  const handlePaymentSaved = () => {
    loadInvoices();
    setPaymentInvoice(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Paid' };
      case 'Partially Paid':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Partially Paid' };
      case 'Confirmed':
        return { bg: '#EBF5FF', text: '#1E40AF', label: 'Confirmed' };
      case 'Draft':
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Draft' };
      case 'Overdue':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Overdue' };
      case 'Cancelled':
        return { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
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
            Invoices
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
            }}
          >
            Manage recurring customer invoices, batch billing generation, payment reconciliation, and overdue balances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px' }}
          >
            <Layers size={17} />
            <span>Batch Invoice Generation</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSingleModalOpen(true)}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px' }}
          >
            <Plus size={18} />
            <span>Generate Invoice</span>
          </button>
        </div>
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
              Total Invoiced
            </span>
            <Receipt size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '8px' }}>
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Collected / Paid
            </span>
            <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '8px' }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Outstanding Balance
            </span>
            <Clock size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: totalOutstanding > 0 ? '#D97706' : 'var(--color-secondary)', marginTop: '8px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Overdue Invoices
            </span>
            <AlertCircle size={18} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: overdueCount > 0 ? 'var(--color-error)' : 'var(--color-secondary)', marginTop: '8px' }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by invoice #, customer, sub #..."
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
              {INVOICE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: 'var(--font-size-input)' }}
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ minWidth: '150px' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
              style={{ height: '42px', fontSize: '13px' }}
              title="Filter by Invoice Date"
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

      {/* Table */}
      <div
        className="card-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {filteredInvoices.length === 0 ? (
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
              <Receipt size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-heading-card)', color: 'var(--color-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>
              No invoices found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', maxWidth: '420px' }}>
              {searchTerm || statusFilter !== 'ALL' || customerFilter !== 'ALL' || dateFilter
                ? 'Try adjusting your search criteria or filter selections.'
                : 'Generate your first customer invoice or batch invoice run.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>Invoice #</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>Customer</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>Subscription</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>Invoice Date</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 'var(--font-size-table-header)' }}>Due Date</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>Total (₹)</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>Paid (₹)</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>Balance Due (₹)</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 'var(--font-size-table-header)' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 'var(--font-size-table-header)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  const hasBalance = (inv.balanceDue || 0) > 0;
                  const canPay = inv.status !== 'Draft' && inv.status !== 'Cancelled' && hasBalance;

                  return (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-background)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Invoice # */}
                      <td style={{ padding: '14px 18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{inv.invoiceNumber}</span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                          {inv.customer?.name}
                        </div>
                      </td>

                      {/* Subscription */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        {inv.subscriptionNumber || '—'}
                      </td>

                      {/* Invoice Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {inv.invoiceDate}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '14px 18px', color: inv.status === 'Overdue' ? 'var(--color-error)' : 'var(--color-text-secondary)', fontWeight: inv.status === 'Overdue' ? 'var(--font-weight-semibold)' : 'normal', fontSize: 'var(--font-size-table-content)' }}>
                        {inv.dueDate}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: '15px' }}>
                        ₹{(inv.grandTotal || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Paid */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', fontSize: '14px' }}>
                        ₹{(inv.amountPaid || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Balance Due */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 'var(--font-weight-bold)', color: hasBalance ? (inv.status === 'Overdue' ? 'var(--color-error)' : '#D97706') : 'var(--color-primary)', fontSize: '15px' }}>
                        ₹{(inv.balanceDue || 0).toLocaleString('en-IN')}
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setViewingInvoice(inv)}
                            className="btn-icon"
                            title="View Invoice"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={17} />
                          </button>

                          {canPay && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentFromInvoice(inv)}
                              className="btn-secondary"
                              title="Record Payment"
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
                              <CreditCard size={13} />
                              <span>Pay</span>
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
      <InvoiceModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onSave={() => {
          loadInvoices();
          setIsSingleModalOpen(false);
        }}
      />

      <BatchInvoiceModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onGenerated={loadInvoices}
      />

      <InvoiceViewModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        onConfirm={handleConfirmInvoice}
        onCancel={handleCancelInvoice}
        onRecordPayment={handleOpenPaymentFromInvoice}
      />

      <PaymentModal
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        onSave={handlePaymentSaved}
        preselectedInvoice={paymentInvoice}
      />
    </div>
  );
}

