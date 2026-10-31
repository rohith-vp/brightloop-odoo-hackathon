import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { productService, PRODUCT_TYPES } from '../services/productService';
import ProductModal from '../components/ProductModal';
import ProductViewModal from '../components/ProductViewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Notification banner
  const [toastMessage, setToastMessage] = useState('');

  const loadProducts = () => {
    const list = productService.getProducts();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.notes && prod.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || prod.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || prod.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, searchTerm, typeFilter, statusFilter]);

  // Statistics
  const totalVariantsCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  }, [products]);

  const activeProductsCount = useMemo(() => {
    return products.filter((p) => p.status === 'active').length;
  }, [products]);

  // CRUD Handlers
  const handleOpenAdd = () => {
    setFormInitialData(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setFormInitialData(product);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProduct = (formData) => {
    if (formInitialData && formInitialData.id) {
      productService.updateProduct(formInitialData.id, formData);
      showToast(`Product "${formData.name}" updated successfully.`);
    } else {
      productService.createProduct(formData);
      showToast(`Product "${formData.name}" created successfully.`);
    }
    setIsFormModalOpen(false);
    loadProducts();
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      productService.deleteProduct(deletingProduct.id);
      showToast(`Product "${deletingProduct.name}" removed from catalog.`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      loadProducts();
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
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
            Products
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Manage recurring subscription items, software services, and hardware packages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Total Catalog Items
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '6px' }}>
            {products.length}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Active Products
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: '6px' }}>
            {activeProductsCount}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <span style={{ fontSize: 'var(--font-size-metric-label)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 'var(--font-weight-medium)' }}>
            Configured Variants
          </span>
          <div style={{ fontSize: 'var(--font-size-metric-value)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)', marginTop: '6px' }}>
            {totalVariantsCount}
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
              placeholder="Search products by name or notes..."
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              <option value="ALL">All Types</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
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
            </select>
          </div>

          {/* Reset */}
          {(searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
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

      {/* 4. Products Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Product Type</th>
                <th>Sales Price</th>
                <th>Cost Price</th>
                <th>Variants</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <Package size={36} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
                      <div
                        style={{
                          fontSize: 'var(--font-size-heading-card)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-secondary)',
                        }}
                      >
                        No products match your criteria
                      </div>
                      <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', maxWidth: '380px' }}>
                        {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'Try clearing your filters or search keywords to view the catalog.'
                          : 'No products exist in your catalog yet. Create your first product to get started.'}
                      </p>
                      {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' ? (
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
                          onClick={handleOpenAdd}
                          className="btn btn-primary"
                          style={{ marginTop: 'var(--space-3)' }}
                        >
                          <Plus size={16} />
                          <span>Add New Product</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const hasOdooVariant = prod.variants?.some((v) =>
                    v.name.toLowerCase().includes('odoo')
                  );

                  return (
                    <tr key={prod.id}>
                      {/* Product Name */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                            {prod.name}
                          </span>
                          {prod.notes && (
                            <span
                              style={{
                                fontSize: 'var(--font-size-helper)',
                                color: 'var(--color-text-secondary)',
                                maxWidth: '320px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {prod.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product Type */}
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
                          {prod.type}
                        </span>
                      </td>

                      {/* Sales Price */}
                      <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {productService.formatCurrency(prod.salesPrice)}
                      </td>

                      {/* Cost Price */}
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-table-content)' }}>
                        {productService.formatCurrency(prod.costPrice)}
                      </td>

                      {/* Variants */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: 'var(--font-size-badge)',
                              fontWeight: 'var(--font-weight-semibold)',
                              color: prod.variants?.length > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                              backgroundColor: prod.variants?.length > 0 ? 'var(--color-surface-green)' : '#F1F3F2',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            {prod.variants?.length || 0} variant{prod.variants?.length === 1 ? '' : 's'}
                          </span>
                          {hasOdooVariant && (
                            <span
                              title="Includes Odoo Sync Variant (+₹560)"
                              style={{
                                fontSize: 'var(--font-size-badge)',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: '#087A4B',
                                border: '1px solid #087A4B',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                backgroundColor: '#E9F3ED',
                              }}
                            >
                              Odoo +₹560
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${prod.status === 'active' ? 'success' : 'pending'}`}>
                          {prod.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenView(prod)}
                            title="View product details"
                            className="btn-icon"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit product"
                            className="btn-icon"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(prod)}
                            title="Delete product"
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
      <ProductModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={formInitialData}
      />

      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewProduct}
        onEdit={(prod) => {
          setIsViewModalOpen(false);
          handleOpenEdit(prod);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingProduct?.name || ''}
      />
    </div>
  );
}
