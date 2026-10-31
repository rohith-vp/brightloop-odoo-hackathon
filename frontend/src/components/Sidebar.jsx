import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Settings, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`layout-sidebar ${isOpen ? 'open' : ''}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--navbar-height)',
          padding: '0 var(--space-6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-inverse)',
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.02em',
            }}
          >
            Brightloop
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation sidebar"
          className="sidebar-close-btn"
          style={{
            color: 'var(--color-text-inverse)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-1)',
          }}
        >
          <X size={20} />
        </button>
      </div>

      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          padding: 'var(--space-4) var(--space-3)',
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive
                  ? 'var(--font-weight-semibold)'
                  : 'var(--font-weight-medium)',
                color: 'var(--color-text-inverse)',
                backgroundColor: isActive
                  ? 'var(--color-secondary)'
                  : 'transparent',
                transition: 'background-color 0.15s ease',
              })}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div
        style={{
          padding: 'var(--space-4) var(--space-6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        v0.1.0 Foundation
      </div>
    </aside>
  );
}

