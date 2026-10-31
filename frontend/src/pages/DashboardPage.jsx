import React from 'react';

export default function DashboardPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Frontend foundation initialized with centralized design tokens and responsive layout.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Core Design Tokens
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Primary</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85 }}>#243B64</div>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Secondary</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85 }}>#4F46E5</div>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Background</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>#F8FAFC</div>
          </div>
        </div>
      </div>
    </div>
  );
}

