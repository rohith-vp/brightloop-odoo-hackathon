import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Layers,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { subscriptionService } from '../services/subscriptionService';
import { invoiceService } from '../services/invoiceService';
import { paymentService } from '../services/paymentService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'subscriptions' | 'invoices' | 'payments'

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    company: '',
    gstin: '',
    status: 'active',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setCustomers(customerService.getCustomers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.gstin?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'active').length;
    const allSubs = subscriptionService.getSubscriptions() || [];
    const allInvoices = invoiceService.getInvoices() || [];
    const totalBilled = Array.isArray(allInvoices)
      ? allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
      : 0;

    return { total, active, totalSubs: allSubs.length, totalBilled };
  }, [customers]);

  // Customer specific analytics
  const getCustomerMetrics = (customerId) => {
    const subs = subscriptionService.getSubscriptionsForCustomer
      ? subscriptionService.getSubscriptionsForCustomer(customerId)
      : [];
    const invoices = invoiceService.getInvoicesByCustomer
      ? invoiceService.getInvoicesByCustomer(customerId)
      : invoiceService.getInvoicesForCustomer
      ? invoiceService.getInvoicesForCustomer(customerId)
      : [];
    const payments = paymentService.getPaymentsByCustomer
      ? paymentService.getPaymentsByCustomer(customerId)
      : paymentService.getPaymentsForCustomer
      ? paymentService.getPaymentsForCustomer(customerId)
      : [];

    const activeSubs = Array.isArray(subs) ? subs.filter((s) => s.status === 'active').length : 0;
    const totalInvoiced = Array.isArray(invoices)
      ? invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
      : 0;
    const totalPaid = Array.isArray(payments)
      ? payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      : 0;
    const balanceDue = Array.isArray(invoices)
      ? invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0)
      : 0;

    return {
      subs: Array.isArray(subs) ? subs : [],
      invoices: Array.isArray(invoices) ? invoices : [],
      payments: Array.isArray(payments) ? payments : [],
      activeSubs,
      totalInvoiced,
      totalPaid,
      balanceDue,
    };
  };

  // Handlers
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      company: '',
      gstin: '',
      status: 'active',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      contactPerson: customer.contactPerson || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      gstin: customer.gstin || '',
      status: customer.status || 'active',
      billingAddress: {
        street: customer.billingAddress?.street || '',
        city: customer.billingAddress?.city || '',
        state: customer.billingAddress?.state || '',
        postalCode: customer.billingAddress?.postalCode || '',
        country: customer.billingAddress?.country || 'India',
      },
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (customer) => {
    setSelectedCustomer(customer);
    setDetailTab('overview');
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (customer) => {
    setDeletingCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Company / Customer Name is required.';
    if (!formData.email?.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCustomer) {
      customerService.updateCustomer(editingCustomer.id, formData);
      showToast(`Customer "${formData.name}" updated successfully.`);
    } else {
      customerService.createCustomer(formData);
      showToast(`New customer "${formData.name}" registered successfully.`);
    }

    setIsFormModalOpen(false);
    loadData();
  };

  const handleConfirmDelete = () => {
    if (deletingCustomer) {
      customerService.deleteCustomer(deletingCustomer.id);
      showToast(`Customer "${deletingCustomer.name}" was removed.`);
      setIsDeleteModalOpen(false);
      setDeletingCustomer(null);
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
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
              marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            Customers Directory
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Manage client profiles, billing contacts, active subscriptions, and financial history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <Users size={18} color="var(--color-primary)" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Total Accounts</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            {stats.total}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Active Clients</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#059669' }}>
            {stats.active}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <Layers size={18} color="#4F46E5" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Subscriptions Held</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            {stats.totalSubs}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <CreditCard size={18} color="#0D9488" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Cumulative Billed</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            ₹{stats.totalBilled.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-surface"
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by company, contact person, email, ID, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-secondary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            STATUS:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '14px 18px' }}>Customer / Company</th>
                <th style={{ padding: '14px 18px' }}>Primary Contact</th>
                <th style={{ padding: '14px 18px' }}>Location</th>
                <th style={{ padding: '14px 18px' }}>Subscriptions</th>
                <th style={{ padding: '14px 18px' }}>Invoiced & Paid</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const metrics = getCustomerMetrics(cust.id);
                  return (
                    <tr
                      key={cust.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Company Name & ID */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--color-surface-green)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                            }}
                          >
                            {cust.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                              {cust.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              ID: {cust.id} {cust.gstin && `• GSTIN: ${cust.gstin}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>
                          {cust.contactPerson || '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {cust.email}
                        </div>
                        {cust.phone && (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {cust.phone}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)' }}>
                        <div>{cust.billingAddress?.city || '—'}</div>
                        <div style={{ fontSize: '12px' }}>{cust.billingAddress?.state || 'India'}</div>
                      </td>

                      {/* Subscriptions */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: metrics.activeSubs > 0 ? '#EEF2FF' : '#F1F5F9',
                            color: metrics.activeSubs > 0 ? '#4F46E5' : '#64748B',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          {metrics.activeSubs} Active ({metrics.subs.length} Total)
                        </span>
                      </td>

                      {/* Financials */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                          ₹{metrics.totalInvoiced.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669' }}>
                          ₹{metrics.totalPaid.toLocaleString('en-IN')} paid
                        </div>
                        {metrics.balanceDue > 0 && (
                          <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                            Due: ₹{metrics.balanceDue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: cust.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                            color: cust.status === 'active' ? '#065F46' : '#6B7280',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: cust.status === 'active' ? '#10B981' : '#9CA3AF',
                            }}
                          />
                          {cust.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenDetail(cust)}
                            title="View Full Profile & Linked Data"
                            style={{
                              background: 'none',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            title="Edit Customer"
                            style={{
                              background: 'none',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(cust)}
                            title="Delete Customer"
                            style={{
                              background: 'none',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: '#DC2626',
                            }}
                          >
                            <Trash2 size={15} />
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

      {/* MODAL 1: ADD / EDIT CUSTOMER */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card-surface"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    Customer / Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${formErrors.name ? '#EF4444' : 'var(--color-border)'}`,
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px', display: 'block' }}>
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="billing@company.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${formErrors.email ? '#EF4444' : 'var(--color-border)'}`,
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                    }}
                  />
                  {formErrors.email && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px', display: 'block' }}>
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AABCT3421K1ZZ"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-secondary)' }}>
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-secondary)',
                      fontSize: '14px',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Billing Address Sub-section */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '10px' }}>
                  Billing Address Details
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Street address / Office building"
                      value={formData.billingAddress.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, street: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="City (e.g. Mumbai)"
                      value={formData.billingAddress.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, city: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        fontSize: '14px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="State (e.g. Maharashtra)"
                      value={formData.billingAddress.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, state: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="PIN / Postal Code"
                      value={formData.billingAddress.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, postalCode: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        fontSize: '14px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.billingAddress.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, country: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMER DOSSIER & LINKED DATA */}
      {isDetailModalOpen && selectedCustomer && (() => {
        const metrics = getCustomerMetrics(selectedCustomer.id);
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              className="card-surface"
              style={{
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {selectedCustomer.name}
                    </h2>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: selectedCustomer.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                        color: selectedCustomer.status === 'active' ? '#065F46' : '#6B7280',
                      }}
                    >
                      {selectedCustomer.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Customer ID: {selectedCustomer.id} • Registered {new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick KPI pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>SUBSCRIPTIONS</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)' }}>{metrics.subs.length}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL INVOICED</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)' }}>₹{metrics.totalInvoiced.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL PAID</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>₹{metrics.totalPaid.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>OUTSTANDING</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: metrics.balanceDue > 0 ? '#DC2626' : '#059669' }}>
                    ₹{metrics.balanceDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '18px' }}>
                {[
                  { id: 'overview', label: 'Overview & Profile', count: null },
                  { id: 'subscriptions', label: 'Subscriptions', count: metrics.subs.length },
                  { id: 'invoices', label: 'Invoices', count: metrics.invoices.length },
                  { id: 'payments', label: 'Payments', count: metrics.payments.length },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: detailTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                      color: detailTab === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {t.label}
                    {t.count !== null && (
                      <span style={{ fontSize: '11px', backgroundColor: 'var(--color-surface-hover)', padding: '1px 6px', borderRadius: '10px' }}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {detailTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                      Contact Information
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Contact Person:</strong> {selectedCustomer.contactPerson || '—'}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Email:</strong> {selectedCustomer.email}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Phone:</strong> {selectedCustomer.phone || '—'}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Company:</strong> {selectedCustomer.company || selectedCustomer.name}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>GSTIN / Tax ID:</strong> {selectedCustomer.gstin || 'Unregistered'}</div>
                    </div>
                  </div>

                  <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                      Billing Address
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-secondary)' }}>
                      <div>{selectedCustomer.billingAddress?.street || 'No street specified'}</div>
                      <div>
                        {selectedCustomer.billingAddress?.city && `${selectedCustomer.billingAddress.city}, `}
                        {selectedCustomer.billingAddress?.state} {selectedCustomer.billingAddress?.postalCode}
                      </div>
                      <div>{selectedCustomer.billingAddress?.country || 'India'}</div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'subscriptions' && (
                <div>
                  {metrics.subs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                      No subscriptions found for this customer.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                          <th style={{ padding: '8px' }}>Sub Number</th>
                          <th style={{ padding: '8px' }}>Product & Plan</th>
                          <th style={{ padding: '8px' }}>Frequency</th>
                          <th style={{ padding: '8px' }}>Amount</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.subs.map((s) => (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{s.subscriptionNumber}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <div>{s.productName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{s.planName}</div>
                            </td>
                            <td style={{ padding: '10px 8px' }}>{s.billingFrequency}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>₹{s.pricing?.recurringAmount?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, backgroundColor: s.status === 'active' ? '#ECFDF5' : '#FEF3C7', color: s.status === 'active' ? '#065F46' : '#92400E' }}>
                                {s.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {detailTab === 'invoices' && (
                <div>
                  {metrics.invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                      No invoices found for this customer.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                          <th style={{ padding: '8px' }}>Invoice #</th>
                          <th style={{ padding: '8px' }}>Date</th>
                          <th style={{ padding: '8px' }}>Total Amount</th>
                          <th style={{ padding: '8px' }}>Paid</th>
                          <th style={{ padding: '8px' }}>Balance</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.invoices.map((inv) => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '10px 8px', color: 'var(--color-text-secondary)' }}>{inv.invoiceDate}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px 8px', color: '#059669' }}>₹{inv.amountPaid?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px 8px', color: inv.balanceDue > 0 ? '#DC2626' : '#059669' }}>₹{inv.balanceDue?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, backgroundColor: inv.status === 'Paid' ? '#ECFDF5' : '#EFF6FF', color: inv.status === 'Paid' ? '#065F46' : '#1E40AF' }}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {detailTab === 'payments' && (
                <div>
                  {metrics.payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                      No payments recorded for this customer.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                          <th style={{ padding: '8px' }}>Payment Ref</th>
                          <th style={{ padding: '8px' }}>Date</th>
                          <th style={{ padding: '8px' }}>Amount</th>
                          <th style={{ padding: '8px' }}>Method</th>
                          <th style={{ padding: '8px' }}>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.payments.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{p.paymentReference}</td>
                            <td style={{ padding: '10px 8px', color: 'var(--color-text-secondary)' }}>{p.paymentDate}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: '#059669' }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px 8px' }}>{p.paymentMethod || 'Bank Transfer'}</td>
                            <td style={{ padding: '10px 8px', color: 'var(--color-text-secondary)' }}>{p.invoiceNumber || p.invoiceId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {isDeleteModalOpen && deletingCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card-surface"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#DC2626' }}>
              <AlertCircle size={28} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', margin: 0 }}>
                Delete Customer Account?
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to remove <strong>{deletingCustomer.name}</strong> ({deletingCustomer.id})? This will unlink customer contact details from active directories.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'transparent',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
