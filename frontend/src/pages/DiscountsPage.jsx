import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { discountService, DISCOUNT_TYPES } from '../services/discountService.js';
import DiscountModal from '../components/DiscountModal.jsx';
import DiscountViewModal from '../components/DiscountViewModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [viewingDiscount, setViewingDiscount] = useState(null);
  const [deletingDiscount, setDeletingDiscount] = useState(null);

  const loadDiscounts = () => {
    const list = discountService.getDiscounts();
    setDiscounts(list);
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  // Filtered List
  const filteredDiscounts = discounts.filter((disc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      disc.name.toLowerCase().includes(term) ||
      (disc.code && disc.code.toLowerCase().includes(term)) ||
      (disc.description && disc.description.toLowerCase().includes(term));

    const matchesType = typeFilter === 'ALL' || disc.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || disc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI Calculations
  const totalDiscounts = discounts.length;
  const activeCount = discounts.filter((d) => d.status === 'active').length;
  const totalUsage = discounts.reduce((acc, d) => acc + (d.usageCount || 0), 0);
  const percentCount = discounts.filter((d) => d.type === 'percentage').length;

  const handleSaveDiscount = (saved) => {
    loadDiscounts();
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  const handleDeleteDiscount = () => {
    if (deletingDiscount) {
      discountService.deleteDiscount(deletingDiscount.id);
      loadDiscounts();
      setDeletingDiscount(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#E9F3ED', text: '#087A4B', label: 'Active' };
      case 'expired':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Expired' };
      case 'upcoming':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Upcoming' };
      case 'inactive':
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Inactive' };
    }
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
              Discounts & Promotions
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
              {discounts.length} Rules Configured
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Configure percentage and flat promotional vouchers, usage quotas, validity windows, and subscription concessions.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingDiscount(null);
            setIsModalOpen(true);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          Create Discount
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
              Active Campaigns
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
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {activeCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>Currently valid & applicable</span>
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Total Redemptions
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
              <Tag size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {totalUsage}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Applied across invoice billings
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Total Discount Rules
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
              <Layers size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {totalDiscounts}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Configured promotions & vouchers
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--font-size-table-header)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Percentage vs Fixed
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
              <Percent size={20} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '26px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {percentCount} / {totalDiscounts - percentCount}
            </span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
            Percentage vs Flat amount rules
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
              placeholder="Search by discount name or code..."
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
          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-table-content)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-white)',
                color: 'var(--color-secondary)',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FBFDFB' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Discount Name
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Code
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Type
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Value
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Valid From
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
                  Valid Until
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-header)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Usage (Limit)
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
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
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
                        <Tag size={24} />
                      </div>
                      <div style={{ fontSize: 'var(--font-size-card-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                        No discounts found
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', maxWidth: '400px' }}>
                        {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'Try adjusting your search query or filters to find what you are looking for.'
                          : 'Create your first promotional discount voucher to get started.'}
                      </p>
                      {(!searchTerm && typeFilter === 'ALL' && statusFilter === 'ALL') && (
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setEditingDiscount(null);
                            setIsModalOpen(true);
                          }}
                          style={{ marginTop: 'var(--space-2)' }}
                        >
                          Create Discount
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((disc) => {
                  const badge = getStatusBadge(disc.status);
                  return (
                    <tr
                      key={disc.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FBF9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                          {disc.name}
                        </div>
                        {disc.description && (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {disc.description}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 'var(--font-weight-semibold)',
                            fontSize: '13px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: '#F3F4F6',
                            color: '#1F2937',
                            border: '1px dashed #D1D5DB',
                          }}
                        >
                          {disc.code}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', textTransform: 'capitalize' }}>
                        {disc.type}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', textAlign: 'right' }}>
                        {disc.type === 'percentage' ? `${disc.value}%` : `₹${disc.value?.toLocaleString('en-IN')}`}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-text-secondary)' }}>
                        {disc.validFrom || 'Immediate'}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', color: 'var(--color-text-secondary)' }}>
                        {disc.validUntil || 'Never'}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-table-content)', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                          {disc.usageCount || 0}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {' '}/ {disc.maxUsageLimit ? disc.maxUsageLimit : '∞'}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-badge)',
                            fontWeight: 'var(--font-weight-medium)',
                            backgroundColor: badge.bg,
                            color: badge.text,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setViewingDiscount(disc)}
                            title="View Discount Details"
                            style={{ padding: '6px 8px' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingDiscount(disc);
                              setIsModalOpen(true);
                            }}
                            title="Edit Discount"
                            style={{ padding: '6px 8px' }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setDeletingDiscount(disc)}
                            title="Delete Discount"
                            style={{ padding: '6px 8px', color: 'var(--color-error)' }}
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

      {/* Create / Edit Modal */}
      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDiscount(null);
        }}
        onSave={handleSaveDiscount}
        discountToEdit={editingDiscount}
      />

      {/* View Details Modal */}
      <DiscountViewModal
        isOpen={!!viewingDiscount}
        onClose={() => setViewingDiscount(null)}
        discount={viewingDiscount}
        onEdit={(disc) => {
          setViewingDiscount(null);
          setEditingDiscount(disc);
          setIsModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingDiscount}
        onClose={() => setDeletingDiscount(null)}
        onConfirm={handleDeleteDiscount}
        itemTitle={deletingDiscount ? `${deletingDiscount.name} (${deletingDiscount.code})` : ''}
      />
    </div>
  );
}

