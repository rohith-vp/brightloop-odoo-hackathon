import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, plansApi, loadVariantOptions } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { validatePlan, hasErrors, BILLING_INTERVALS, END_BEHAVIORS } from '../lib/validation';
import { addMoney } from '../lib/money';
import { FormField, TextInput, SelectInput, Notice, ListPager } from '../components/forms';
import { panelStyle, formGridStyle, sectionTitleStyle } from '../styles/forms';

const EMPTY_PLAN = {
  name: '',
  product_variant_id: '',
  billing_interval: 'MONTH',
  minimum_quantity: '1',
  end_behavior: 'AUTO_CLOSE',
  available_from: '',
  available_to: '',
};

const intervalLabel = (value) => BILLING_INTERVALS.find((i) => i.value === value)?.label ?? value;
const endLabel = (value) => (value === 'MANUAL_CLOSE' ? 'Manual close' : 'Auto close');

export default function PlansPage() {
  const { canManageCatalog } = useAuth();
  const [plans, setPlans] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);

  const [variants, setVariants] = useState([]);
  const [optionsError, setOptionsError] = useState('');

  const [editing, setEditing] = useState(null); // null, 'new', or a plan id
  const [form, setForm] = useState(EMPTY_PLAN);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const variantLabels = useMemo(
    () =>
      new Map(
        variants.map((v) => [
          v.id,
          `${v.productName} · ${v.attribute}: ${v.value} (${addMoney(v.salePrice, v.priceExtra)} per seat)`,
        ]),
      ),
    [variants],
  );

  const variantOptions = useMemo(
    () => variants.map((v) => ({ value: v.id, label: variantLabels.get(v.id) })),
    [variants, variantLabels],
  );

  const loadPlans = useCallback(async (page = 1) => {
    try {
      const { data, meta: pageMeta } = await plansApi.list({ page, page_size: 10 });
      setPlans(data);
      setMeta(pageMeta);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      setVariants(await loadVariantOptions());
      setOptionsError('');
    } catch (err) {
      setOptionsError(err.message);
    }
  }, []);

  useEffect(() => {
    loadPlans(1);
    loadOptions();
  }, [loadPlans, loadOptions]);

  const openNew = () => {
    setEditing('new');
    setForm(EMPTY_PLAN);
    setFormErrors({});
    setFormError('');
  };

  const openEdit = (plan) => {
    setEditing(plan.id);
    setForm({
      name: plan.name,
      product_variant_id: plan.product_variant_id,
      billing_interval: plan.billing_interval,
      minimum_quantity: String(plan.minimum_quantity),
      end_behavior: plan.end_behavior,
      available_from: plan.available_from ?? '',
      available_to: plan.available_to ?? '',
    });
    setFormErrors({});
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validatePlan(form);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    const payload = {
      name: form.name.trim(),
      product_variant_id: form.product_variant_id,
      billing_interval: form.billing_interval,
      minimum_quantity: Number(form.minimum_quantity),
      end_behavior: form.end_behavior,
      available_from: form.available_from || null,
      available_to: form.available_to || null,
    };

    setSaving(true);
    try {
      if (editing === 'new') {
        await plansApi.create(payload);
        setNotice({ tone: 'success', text: `Created plan ${payload.name}.` });
      } else {
        await plansApi.update(editing, payload);
        setNotice({ tone: 'success', text: `Saved plan ${payload.name}.` });
      }
      setEditing(null);
      await loadPlans(meta?.page ?? 1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && Object.keys(err.details).length > 0) {
        setFormErrors(err.details);
        setFormError('Please fix the highlighted fields.');
      } else {
        setFormError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete the plan ${plan.name}?`)) return;
    try {
      await plansApi.remove(plan.id);
      setNotice({ tone: 'success', text: `Deleted plan ${plan.name}.` });
      await loadPlans(meta?.page ?? 1);
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    }
  };

  const setField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    if (formErrors[name]) setFormErrors((current) => ({ ...current, [name]: '' }));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', letterSpacing: '-0.02em' }}>
            Plans
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            What a subscription costs, how often it bills, its minimum quantity, and when it is available.
          </p>
        </div>
        {canManageCatalog && editing === null && (
          <button type="button" className="btn btn-primary" onClick={openNew} disabled={variants.length === 0}>
            New plan
          </button>
        )}
      </div>

      {notice && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}
      {optionsError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice>Could not load products for the plan form: {optionsError}</Notice>
        </div>
      )}
      {canManageCatalog && variants.length === 0 && !optionsError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice tone="success">Add a product with at least one variant before creating a plan.</Notice>
        </div>
      )}

      {editing !== null && (
        <form className="card-surface" style={panelStyle} onSubmit={handleSubmit} noValidate>
          <h2 style={sectionTitleStyle}>{editing === 'new' ? 'New plan' : 'Edit plan'}</h2>
          {formError && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Notice>{formError}</Notice>
            </div>
          )}
          <div style={formGridStyle}>
            <FormField label="Plan name" htmlFor="plan-name" error={formErrors.name}>
              <TextInput id="plan-name" value={form.name} onChange={setField('name')} error={formErrors.name} />
            </FormField>
            <FormField label="Product variant" htmlFor="plan-variant" error={formErrors.product_variant_id}>
              <SelectInput
                id="plan-variant"
                placeholder="Choose a variant"
                options={variantOptions}
                value={form.product_variant_id}
                onChange={setField('product_variant_id')}
                error={formErrors.product_variant_id}
              />
            </FormField>
            <FormField label="Billing interval" htmlFor="plan-interval" error={formErrors.billing_interval}>
              <SelectInput id="plan-interval" options={BILLING_INTERVALS} value={form.billing_interval} onChange={setField('billing_interval')} error={formErrors.billing_interval} />
            </FormField>
            <FormField label="Minimum quantity (seats)" htmlFor="plan-min" error={formErrors.minimum_quantity}>
              <TextInput id="plan-min" type="number" min="1" step="1" value={form.minimum_quantity} onChange={setField('minimum_quantity')} error={formErrors.minimum_quantity} />
            </FormField>
            <FormField label="End behavior" htmlFor="plan-end" error={formErrors.end_behavior}>
              <SelectInput id="plan-end" options={END_BEHAVIORS} value={form.end_behavior} onChange={setField('end_behavior')} error={formErrors.end_behavior} />
            </FormField>
            <FormField label="Available from" htmlFor="plan-from" error={formErrors.available_from} hint="Optional">
              <TextInput id="plan-from" type="date" value={form.available_from} onChange={setField('available_from')} error={formErrors.available_from} />
            </FormField>
            <FormField label="Available until" htmlFor="plan-to" error={formErrors.available_to} hint="Optional">
              <TextInput id="plan-to" type="date" value={form.available_to} onChange={setField('available_to')} error={formErrors.available_to} />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-4)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save plan'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
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
              <th>Plan</th>
              <th>Interval</th>
              <th>Min seats</th>
              <th>Unit price</th>
              <th>End behavior</th>
              <th>Availability</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: 'var(--color-text-secondary)' }}>
                  No plans yet.
                </td>
              </tr>
            )}
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.name}</td>
                <td>{intervalLabel(plan.billing_interval)}</td>
                <td>{plan.minimum_quantity}</td>
                <td>{plan.unit_price}</td>
                <td>{endLabel(plan.end_behavior)}</td>
                <td>
                  {plan.available_from || plan.available_to
                    ? `${plan.available_from ?? 'Open'} to ${plan.available_to ?? 'open'}`
                    : 'Always'}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {canManageCatalog && (
                    <>
                      <button type="button" className="btn btn-secondary" onClick={() => openEdit(plan)}>
                        Edit
                      </button>{' '}
                      <button type="button" className="btn btn-secondary" onClick={() => handleDelete(plan)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ListPager meta={meta} onPage={loadPlans} />
    </div>
  );
}
