import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Calendar,
  Eye,
  CheckCircle2,
  Receipt,
  Filter,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { paymentService } from '../../services/paymentService.js';
import CustomerPaymentReceiptModal from '../../components/CustomerPaymentReceiptModal.jsx';

export default function CustomerPaymentsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewingPayment, setViewingPayment] = useState(null);

  const loadData = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const list = paymentService.getMyPayments();
    setPayments(list);
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  if (!currentUser) return null;

  // Filtered payments
  const filteredPayments = payments.filter((pay) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      pay.paymentReference.toLowerCase().includes(term) ||
      (pay.invoiceNumber && pay.invoiceNumber.toLowerCase().includes(term)) ||
      (pay.referenceNumber && pay.referenceNumber.toLowerCase().includes(term));

    const matchesDate = !dateFilter || pay.paymentDate === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

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
            My Payments
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
            {payments.length} Transactions
          </span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Review payment confirmations, transaction references, and download official payment receipts.
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
            placeholder="Search by payment ref, invoice #, or transaction ID..."
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
              onClick={() => setDateFilter('')}
              className="btn btn-secondary"
              style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '12px' }}
            >
              Clear
            </button>
          )}
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
                  Invoice #
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Payment Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Payment Method
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <CreditCard size={32} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        No payments found
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
                        {searchTerm || dateFilter
                          ? 'Try adjusting your search criteria.'
                          : 'No inbound payment settlements have been recorded for your account yet.'}
                      </p>
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
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                        {pay.referenceNumber || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Receipt size={13} />
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
                          fontSize: '12px',
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {pay.paymentMethod}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', textAlign: 'right' }}>
                      ₹{(pay.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-badge)',
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: '#E9F3ED',
                          color: '#087A4B',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Settled
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      <button
                        onClick={() => setViewingPayment(pay)}
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

      {/* Payment Receipt Modal */}
      <CustomerPaymentReceiptModal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        payment={viewingPayment}
      />
    </div>
  );
}

