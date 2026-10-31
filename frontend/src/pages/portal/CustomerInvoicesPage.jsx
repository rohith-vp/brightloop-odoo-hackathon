import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { invoiceService } from '../../services/invoiceService.js';
import CustomerInvoiceModal from '../../components/CustomerInvoiceModal.jsx';

export default function CustomerInvoicesPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const loadData = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const list = invoiceService.getMyInvoices();
    setInvoices(list);
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  if (!currentUser) return null;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.subscriptionNumber && inv.subscriptionNumber.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#E9F3ED', text: '#087A4B' };
      case 'Partially Paid':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Overdue':
        return { bg: '#FDE8E8', text: '#9B1C1C' };
      case 'Draft':
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
            My Invoices
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
            {invoices.length} Invoices
          </span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Access tax invoices, examine GST breakdowns, monitor settlement balances, and print copies.
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
            placeholder="Search by invoice # or subscription #..."
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
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FBFDFB' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Invoice #
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Invoice Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Due Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Total Amount
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Amount Paid
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Balance Due
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Receipt size={32} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        No invoices found
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'Try adjusting your search query or filters.'
                          : 'There are no billing invoices generated for your account yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  return (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', fontSize: 'var(--font-size-table-content)' }}>
                          {inv.invoiceNumber}
                        </div>
                        {inv.subscriptionNumber && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Sub: {inv.subscriptionNumber}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-text-secondary)' }}>
                        {inv.invoiceDate}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: inv.status === 'Overdue' ? 'var(--color-error)' : 'var(--color-secondary)' }}>
                        {inv.dueDate}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', textAlign: 'right' }}>
                        ₹{(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: '#059669', textAlign: 'right' }}>
                        ₹{(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: (inv.balanceDue || 0) > 0 ? 'var(--color-error)' : 'var(--color-primary)', textAlign: 'right' }}>
                        ₹{(inv.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
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
                          {inv.status}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <button
                            onClick={() => setViewingInvoice(inv)}
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
                            View
                          </button>
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="btn btn-secondary"
                            title="Print Invoice"
                            style={{
                              padding: '5px 8px',
                              fontSize: '12px',
                            }}
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <CustomerInvoiceModal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
    </div>
  );
}

