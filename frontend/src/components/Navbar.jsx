import React from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="layout-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="mobile-nav-toggle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-primary)',
          }}
        >
          <Menu size={22} />
        </button>
        <span
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-primary)',
          }}
        >
          Brightloop
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-secondary)',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          Foundation Setup
        </span>
      </div>
    </header>
  );
}

