import { AlertCircle, CheckCircle2 } from 'lucide-react';

const controlStyle = (hasError) => ({
  width: '100%',
  padding: '9px 12px',
  fontSize: 'var(--font-size-body)',
  color: 'var(--color-text-main)',
  backgroundColor: 'var(--color-surface)',
  border: `1px solid ${hasError ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
});

export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-main)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <div
          role="alert"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-overdue-text)', fontSize: '12px', marginTop: '4px' }}
        >
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '4px' }}>{hint}</div>
      ) : null}
    </div>
  );
}

export function TextInput({ id, error, ...props }) {
  return (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      style={controlStyle(Boolean(error))}
      {...props}
    />
  );
}

export function TextArea({ id, error, ...props }) {
  return <textarea id={id} aria-invalid={Boolean(error)} rows={3} style={{ ...controlStyle(Boolean(error)), resize: 'vertical' }} {...props} />;
}

export function SelectInput({ id, error, options, placeholder, ...props }) {
  return (
    <select id={id} aria-invalid={Boolean(error)} style={controlStyle(Boolean(error))} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Notice({ tone = 'error', children }) {
  const isError = tone === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isError ? 'var(--status-overdue-bg)' : 'var(--status-success-bg)',
        color: isError ? 'var(--status-overdue-text)' : 'var(--status-success-text)',
        fontSize: 'var(--font-size-body)',
      }}
    >
      <Icon size={16} />
      <span>{children}</span>
    </div>
  );
}

export function ListPager({ meta, onPage }) {
  if (!meta) return null;
  const lastPage = Math.max(1, Math.ceil(meta.total / meta.page_size));
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: 'var(--space-3) 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
      <span>
        Page {meta.page} of {lastPage} · {meta.total} total
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" className="btn btn-secondary" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          Previous
        </button>
        <button type="button" className="btn btn-secondary" disabled={meta.page >= lastPage} onClick={() => onPage(meta.page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
