import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { paymentService, PAYMENT_METHODS } from '../services/paymentService.js';
import { customerService } from '../services/customerService.js';
import PaymentModal from '../components/PaymentModal.jsx';
import PaymentViewModal from '../components/PaymentViewModal.jsx';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);

  const loadPayments = () => {
    const list = paymentService.getPayments();
    setPayments(list);
    setCustomers(customerService.getCustomers());
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Filtered List
  const filteredPayments = payments.filter((pay) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (pay.paymentReference && pay.paymentReference.toLowerCase().includes(term)) ||
      (pay.customerName && pay.customerName.toLowerCase().includes(term)) ||
      (pay.invoiceNumber && pay.invoiceNumber.toLowerCase().includes(term)) ||
      (pay.referenceNumber && pay.referenceNumber.toLowerCase().includes(term));

    const matchesMethod = methodFilter === 'ALL' || pay.paymentMethod === methodFilter;
    const matchesDate = !dateFilter || pay.paymentDate === dateFilter;

    return matchesSearch && matchesMethod && matchesDate;
  });

  // KPI Calculations
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalCount = payments.length;
  const upiCount = payments.filter((p) => p.paymentMethod === 'UPI').length;
  const bankCount = payments.filter((p) => p.paymentMethod === 'Bank Transfer').length;

  const handleSavePayment = (savedPay) => {
    loadPayments();
    setIsRecordModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
            <h1
              style={{
                fontSize: 'var(--font-size-heading-main)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.02em',
              }}
            >
              Payments
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
              {payments.length} Recorded
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Track collections, reconcile invoice settlements, and monitor payment methods across subscriptions.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsRecordModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          Record Payment
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Total Collected
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
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>Reconciled through payment log</span>
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Transactions Count
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
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {totalCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Confirmed inbound settlements
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Bank Wire Transfers
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#F3F4F6',
                color: '#4B5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {bankCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Enterprise RTGS / NEFT transfers
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              UPI & Digital
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
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {upiCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Instant QR / VPA mandate settlements
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 320px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
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
              placeholder="Search by payment ref, invoice #, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-focus"
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3) var(--space-2) 38px',
                fontSize: 'var(--font-size-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          {/* Method Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-table-content)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-white)',
                color: 'var(--color-secondary)',
              }}
            >
              <option value="ALL">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-table-content)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-white)',
                color: 'var(--color-secondary)',
              }}
            />
            {dateFilter && (
              <button
                className="btn btn-secondary"
                onClick={() => setDateFilter('')}
                style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '12px' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FBFDFB' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Payment Ref
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Customer
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Invoice Number
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Payment Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Method
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Amount
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-surface-green)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CreditCard size={24} />
                      </div>
                      <div style={{ fontSize: 'var(--font-size-card-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        No payments found
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', maxWidth: '400px' }}>
                        {searchTerm || methodFilter !== 'ALL' || dateFilter
                          ? 'Try adjusting your search query or filters to find what you are looking for.'
                          : 'Record your first invoice payment settlement to get started.'}
                      </p>
                      {(!searchTerm && methodFilter === 'ALL' && !dateFilter) && (
                        <button
                          className="btn btn-primary"
                          onClick={() => setIsRecordModalOpen(true)}
                          style={{ marginTop: 'var(--space-2)' }}
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {pay.paymentReference}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {pay.referenceNumber || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-secondary)' }}>
                      {pay.customerName}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--color-primary)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        <Receipt size={14} />
                        {pay.invoiceNumber}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-text-secondary)' }}>
                      {pay.paymentDate}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: 'var(--font-size-badge)',
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {pay.paymentMethod}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', textAlign: 'right' }}>
                      ₹{pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setViewingPayment(pay)}
                        title="View Payment Receipt"
                        style={{
                          padding: '6px 10px',
                          fontSize: '13px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSavePayment}
      />

      {/* View Payment Receipt Modal */}
      <PaymentViewModal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        payment={viewingPayment}
      />
    </div>
  );
}

