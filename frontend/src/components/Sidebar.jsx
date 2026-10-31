import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Repeat,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  Users,
  BarChart3,
  Settings,
  Search,
  X,
  LogOut,
} from 'lucide-react';

const navigationGroups = [
  {
    title: 'MAIN MENU',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Products', path: '/products', icon: Package },
      { label: 'Plans', path: '/plans', icon: Layers },
      { label: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Quotations', path: '/quotations', icon: FileText },
      { label: 'Invoices', path: '/invoices', icon: Receipt },
      { label: 'Payments', path: '/payments', icon: CreditCard },
      { label: 'Discounts', path: '/discounts', icon: Percent },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Customers', path: '/customers', icon: Users },
      { label: 'Reports', path: '/reports', icon: BarChart3 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <aside className={`layout-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--navbar-height)',
          padding: '0 var(--space-5)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-inverse)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '15px',
            }}
          >
            B
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '-0.02em',
                color: 'var(--color-secondary)',
                lineHeight: 1.15,
              }}
            >
              Brightloop
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Subscriptions
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation sidebar"
          className="sidebar-close-btn"
          style={{
            color: 'var(--color-text-secondary)',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Sidebar Search Field */}
      <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-2)' }}>
        <div className="search-input-wrapper" style={{ padding: '6px 10px', minHeight: '38px' }}>
          <Search size={15} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: 'var(--font-size-helper)' }}
          />
        </div>
      </div>

      {/* Grouped Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {navigationGroups.map((group) => {
          const filteredItems = group.items.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div
                style={{
                  fontSize: 'var(--font-size-section-label)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                }}
              >
                {group.title}
              </div>

              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-link-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <IconComponent size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#FAFCFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-green)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            RV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Rohith V P
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Billing Admin
            </span>
          </div>
        </div>

        <Link
          to="/login"
          title="Sign out of Brightloop"
          style={{
            color: 'var(--color-text-secondary)',
            padding: '6px',
            borderRadius: 'var(--radius-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-overdue-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <LogOut size={17} />
        </Link>
      </div>
    </aside>
  );
}
