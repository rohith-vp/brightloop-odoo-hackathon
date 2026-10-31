import { useCallback, useEffect, useState } from 'react';
import { ApiError, productsApi } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { validateProduct, validateVariant, hasErrors } from '../lib/validation';
import { formatCents, toCents } from '../lib/money';
import { FormField, TextInput, TextArea, Notice, ListPager } from '../components/forms';
import { panelStyle, formGridStyle, sectionTitleStyle } from '../styles/forms';

const EMPTY_PRODUCT = { name: '', type: '', sale_price: '', cost_price: '', notes: '' };
const EMPTY_VARIANT = { attribute: '', value: '', price_extra: '' };

export default function ProductsPage() {
  const { canManageCatalog } = useAuth();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);

  const [editing, setEditing] = useState(null); // null, 'new', or a product id
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);
  const [variantErrors, setVariantErrors] = useState({});
  const [variantError, setVariantError] = useState('');

  const loadProducts = useCallback(async (page = 1) => {
    try {
      const { data, meta: pageMeta } = await productsApi.list({ page, page_size: 10 });
      setProducts(data);
      setMeta(pageMeta);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  // Refreshes the expanded product so its variant list is current.
  const refreshExpanded = async () => {
    if (!expandedId) return;
    const updated = await productsApi.get(expandedId);
    setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  };

  const openNew = () => {
    setEditing('new');
    setForm(EMPTY_PRODUCT);
    setFormErrors({});
    setFormError('');
  };

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      type: product.type ?? '',
      sale_price: product.sale_price,
      cost_price: product.cost_price ?? '',
      notes: product.notes ?? '',
    });
    setFormErrors({});
    setFormError('');
  };

  const closeForm = () => {
    setEditing(null);
    setFormError('');
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const errors = validateProduct(form);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    const payload = {
      name: form.name.trim(),
      type: form.type.trim() || null,
      sale_price: form.sale_price.trim(),
      cost_price: form.cost_price.trim() || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (editing === 'new') {
        await productsApi.create(payload);
        setNotice({ tone: 'success', text: `Created ${payload.name}.` });
      } else {
        await productsApi.update(editing, payload);
        setNotice({ tone: 'success', text: `Saved ${payload.name}.` });
      }
      setEditing(null);
      await loadProducts(meta?.page ?? 1);
      await refreshExpanded();
    } catch (err) {
      applyServerErrors(err, setFormErrors, setFormError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name} and all its variants? This cannot be undone.`)) return;
    try {
      await productsApi.remove(product.id);
      setNotice({ tone: 'success', text: `Deleted ${product.name}.` });
      if (expandedId === product.id) setExpandedId(null);
      await loadProducts(meta?.page ?? 1);
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    }
  };

  const toggleExpanded = (productId) => {
    setExpandedId((current) => (current === productId ? null : productId));
    setVariantForm(EMPTY_VARIANT);
    setVariantErrors({});
    setVariantError('');
  };

  const handleAddVariant = async (event, productId) => {
    event.preventDefault();
    const errors = validateVariant(variantForm);
    setVariantErrors(errors);
    if (hasErrors(errors)) return;

    try {
      await productsApi.addVariant(productId, {
        attribute: variantForm.attribute.trim(),
        value: variantForm.value.trim(),
        price_extra: variantForm.price_extra.trim() || '0.00',
      });
      setVariantForm(EMPTY_VARIANT);
      setVariantErrors({});
      setVariantError('');
      await refreshExpanded();
    } catch (err) {
      applyServerErrors(err, setVariantErrors, setVariantError);
    }
  };

  const handleRemoveVariant = async (variant) => {
    if (!window.confirm(`Remove ${variant.attribute}: ${variant.value}?`)) return;
    try {
      await productsApi.removeVariant(variant.id);
      await refreshExpanded();
    } catch (err) {
      setVariantError(err.message);
    }
  };

  const setField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    if (formErrors[name]) setFormErrors((current) => ({ ...current, [name]: '' }));
  };

  const setVariantField = (name) => (event) => {
    setVariantForm((current) => ({ ...current, [name]: event.target.value }));
    if (variantErrors[name]) setVariantErrors((current) => ({ ...current, [name]: '' }));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', letterSpacing: '-0.02em' }}>
            Products
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Products and their variants. A variant's price extra is added to the sale price for every seat.
          </p>
        </div>
        {canManageCatalog && editing === null && (
          <button type="button" className="btn btn-primary" onClick={openNew}>
            New product
          </button>
        )}
      </div>

      {notice && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}
      {!canManageCatalog && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice tone="success">You can view products. Admins and staff can change them.</Notice>
        </div>
      )}

      {editing !== null && (
        <form className="card-surface" style={panelStyle} onSubmit={handleProductSubmit} noValidate>
          <h2 style={sectionTitleStyle}>{editing === 'new' ? 'New product' : 'Edit product'}</h2>
          {formError && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Notice>{formError}</Notice>
            </div>
          )}
          <div style={formGridStyle}>
            <FormField label="Name" htmlFor="product-name" error={formErrors.name}>
              <TextInput id="product-name" value={form.name} onChange={setField('name')} error={formErrors.name} />
            </FormField>
            <FormField label="Type" htmlFor="product-type" error={formErrors.type} hint="For example, SERVICE or HARDWARE">
              <TextInput id="product-type" value={form.type} onChange={setField('type')} error={formErrors.type} />
            </FormField>
            <FormField label="Sale price (per seat)" htmlFor="product-sale" error={formErrors.sale_price}>
              <TextInput id="product-sale" inputMode="decimal" placeholder="100.00" value={form.sale_price} onChange={setField('sale_price')} error={formErrors.sale_price} />
            </FormField>
            <FormField label="Cost price" htmlFor="product-cost" error={formErrors.cost_price} hint="Optional">
              <TextInput id="product-cost" inputMode="decimal" placeholder="40.00" value={form.cost_price} onChange={setField('cost_price')} error={formErrors.cost_price} />
            </FormField>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <FormField label="Notes" htmlFor="product-notes" error={formErrors.notes}>
              <TextArea id="product-notes" value={form.notes} onChange={setField('notes')} error={formErrors.notes} />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-4)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loadError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice>{loadError}</Notice>
        </div>
      )}

      <div className="table-container card-surface">
        <table className="fintech-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Sale price</th>
              <th>Variants</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--color-text-secondary)' }}>
                  No products yet.
                </td>
              </tr>
            )}
            {products.map((product) => {
              const expanded = expandedId === product.id;
              return [
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.type ?? '—'}</td>
                  <td>{product.sale_price}</td>
                  <td>{product.variants ? product.variants.length : '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => toggleExpanded(product.id)} aria-expanded={expanded}>
                      {expanded ? 'Hide variants' : 'Variants'}
                    </button>
                    {canManageCatalog && (
                      <>
                        {' '}
                        <button type="button" className="btn btn-secondary" onClick={() => openEdit(product)}>
                          Edit
                        </button>{' '}
                        <button type="button" className="btn btn-secondary" onClick={() => handleDelete(product)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>,
                expanded && (
                  <tr key={`${product.id}-variants`}>
                    <td colSpan={5} style={{ background: 'var(--color-surface-green)' }}>
                      <div style={{ padding: 'var(--space-2) 0' }}>
                        <h3 style={{ ...sectionTitleStyle, fontSize: '14px', marginBottom: 'var(--space-2)' }}>Variants</h3>
                        {variantError && (
                          <div style={{ marginBottom: 'var(--space-3)' }}>
                            <Notice>{variantError}</Notice>
                          </div>
                        )}
                        {product.variants?.length === 0 && (
                          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                            No variants yet. Add one below, then plans can use it.
                          </p>
                        )}
                        {product.variants?.map((variant) => (
                          <div key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <span style={{ flex: 1 }}>
                              <strong>{variant.attribute}:</strong> {variant.value}
                            </span>
                            <span>+{variant.price_extra}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              unit {formatCents(toCents(product.sale_price) + toCents(variant.price_extra))}
                            </span>
                            {canManageCatalog && (
                              <button type="button" className="btn btn-secondary" onClick={() => handleRemoveVariant(variant)}>
                                Remove
                              </button>
                            )}
                          </div>
                        ))}

                        {canManageCatalog && (
                          <form onSubmit={(event) => handleAddVariant(event, product.id)} noValidate style={{ marginTop: 'var(--space-4)' }}>
                            <div style={formGridStyle}>
                              <FormField label="Attribute" htmlFor={`va-${product.id}`} error={variantErrors.attribute} hint="For example, Brand">
                                <TextInput id={`va-${product.id}`} value={variantForm.attribute} onChange={setVariantField('attribute')} error={variantErrors.attribute} />
                              </FormField>
                              <FormField label="Value" htmlFor={`vv-${product.id}`} error={variantErrors.value} hint="For example, Odoo">
                                <TextInput id={`vv-${product.id}`} value={variantForm.value} onChange={setVariantField('value')} error={variantErrors.value} />
                              </FormField>
                              <FormField label="Price extra" htmlFor={`vp-${product.id}`} error={variantErrors.price_extra} hint="Added per seat. Blank means 0.00">
                                <TextInput id={`vp-${product.id}`} inputMode="decimal" placeholder="560.00" value={variantForm.price_extra} onChange={setVariantField('price_extra')} error={variantErrors.price_extra} />
                              </FormField>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }}>
                              Add variant
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
      <ListPager meta={meta} onPage={loadProducts} />
    </div>
  );
}

// Maps a 422 response's per-field details onto the form, and shows other errors as a banner.
function applyServerErrors(err, setFieldErrors, setBanner) {
  if (err instanceof ApiError && err.status === 422 && Object.keys(err.details).length > 0) {
    setFieldErrors(err.details);
    setBanner('Please fix the highlighted fields.');
    return;
  }
  setBanner(err.message);
}
