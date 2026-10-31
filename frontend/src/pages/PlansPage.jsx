import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { planService, BILLING_FREQUENCIES } from '../services/planService';
import PlanModal from '../components/PlanModal';
import PlanViewModal from '../components/PlanViewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const loadPlans = () => {
    const list = planService.getPlans();
    setPlans(list);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filter & Search
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        plan.name.toLowerCase().includes(query) ||
        (plan.productName && plan.productName.toLowerCase().includes(query)) ||
        (plan.description && plan.description.toLowerCase().includes(query));

      const matchesFreq =
        frequencyFilter === 'ALL' || plan.billingFrequency === frequencyFilter;
      const matchesStatus =
        statusFilter === 'ALL' || plan.status === statusFilter;

      return matchesSearch && matchesFreq && matchesStatus;
    });
  }, [plans, searchTerm, frequencyFilter, statusFilter]);

  // Metric counts
  const totalPlansCount = plans.length;
  const activePlansCount = useMemo(
    () => plans.filter((p) => p.status === 'active').length,
    [plans]
  );
  const monthlyPlansCount = useMemo(
    () => plans.filter((p) => p.billingFrequency === 'Monthly').length,
    [plans]
  );
  const annualPlansCount = useMemo(
    () => plans.filter((p) => p.billingFrequency === 'Yearly').length,
    [plans]
  );

  // CRUD Handlers
  const handleOpenCreate = () => {
    setFormInitialData(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setFormInitialData(plan);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (plan) => {
    setViewPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (plan) => {
    setDeletingPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleSavePlan = (formData) => {
    if (formInitialData && formInitialData.id) {
      planService.updatePlan(formInitialData.id, formData);
      showToast(`Plan "${formData.name}" updated successfully.`);
    } else {
      planService.createPlan(formData);
      showToast(`Plan "${formData.name}" created successfully.`);
    }
    setIsFormModalOpen(false);
    loadPlans();
  };

  const handleConfirmDelete = () => {
    if (deletingPlan) {
      planService.deletePlan(deletingPlan.id);
      showToast(`Plan "${deletingPlan.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingPlan(null);
      loadPlans();
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFrequencyFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
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
              marginBottom: '4px',
            }}
          >
            Plans
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Manage billing plans and subscription configurations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Create Plan</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Total Plans
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '6px' }}>
            {totalPlansCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Active Plans
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '6px' }}>
            {activePlansCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Monthly Subscriptions
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '6px' }}>
            {monthlyPlansCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Annual Packages
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '6px' }}>
            {annualPlansCount}
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div
        className="card-surface"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
          <div className="search-input-wrapper">
            <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans by name, product or description..."
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {/* Billing Frequency Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Frequency:</span>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              style={{
                height: '42px',
                padding: '8px 12px',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-main)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Frequencies</option>
              {BILLING_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: '42px',
                padding: '8px 12px',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-main)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || frequencyFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
              title="Reset all search and filter conditions"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Plans Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Product</th>
                <th>Billing Cycle</th>
                <th>Price</th>
                <th>Minimum Quantity</th>
                <th>Availability</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <Layers size={36} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
                      <div
                        style={{
                          fontSize: 'var(--font-size-heading-card)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-secondary)',
                        }}
                      >
                        No plans match your criteria
                      </div>
                      <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', maxWidth: '380px' }}>
                        {searchTerm || frequencyFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'Try adjusting or clearing your search filters to view your plans catalog.'
                          : 'No billing plans configured yet. Create your first plan to start offering subscriptions.'}
                      </p>
                      {searchTerm || frequencyFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="btn btn-secondary"
                          style={{ marginTop: 'var(--space-3)' }}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenCreate}
                          className="btn btn-primary"
                          style={{ marginTop: 'var(--space-3)' }}
                        >
                          <Plus size={16} />
                          <span>Create New Plan</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const availabilityLabel = plan.startDate
                    ? `${plan.startDate} → ${plan.endDate ? plan.endDate : 'Ongoing'}`
                    : 'Ongoing';

                  return (
                    <tr key={plan.id}>
                      {/* Plan Name */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                            {plan.name}
                          </span>
                          {plan.description && (
                            <span
                              style={{
                                fontSize: 'var(--font-size-helper)',
                                color: 'var(--color-text-secondary)',
                                maxWidth: '300px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {plan.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Associated Product */}
                      <td>
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-main)', fontSize: 'var(--font-size-table-content)' }}>
                          {plan.productName}
                        </span>
                      </td>

                      {/* Billing Cycle */}
                      <td>
                        <span
                          style={{
                            fontSize: 'var(--font-size-helper)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-main)',
                            backgroundColor: 'var(--color-background)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {plan.billingFrequency}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {planService.formatCurrency(plan.price)}
                      </td>

                      {/* Minimum Quantity */}
                      <td style={{ color: 'var(--color-text-main)', fontSize: 'var(--font-size-table-content)' }}>
                        {plan.minQuantity || 1} unit(s)
                      </td>

                      {/* Availability */}
                      <td>
                        <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {availabilityLabel}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-badge ${
                            plan.status === 'active'
                              ? 'success'
                              : plan.status === 'expired'
                              ? 'overdue'
                              : 'pending'
                          }`}
                        >
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenView(plan)}
                            title="View plan details & lifecycle"
                            className="btn-icon"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(plan)}
                            title="Edit plan"
                            className="btn-icon"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(plan)}
                            title="Delete plan"
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: 'var(--status-overdue-text)' }}
                          >
                            <Trash2 size={16} />
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

      {/* Modals */}
      <PlanModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePlan}
        initialData={formInitialData}
      />

      <PlanViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        plan={viewPlan}
        onEdit={(plan) => {
          setIsViewModalOpen(false);
          handleOpenEdit(plan);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingPlan?.name || ''}
      />
    </div>
  );
}

