import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
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
  ChevronRight,
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-inverse)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '14px',
            }}
          >
            B
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '15px',
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
                fontSize: '10px',
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
        <div className="search-input-wrapper" style={{ padding: '5px 8px' }}>
          <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '12px' }}
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
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{
                  fontSize: '11px',
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
                    <IconComponent size={16} />
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
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-green)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '12px',
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
                fontSize: '13px',
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
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name ?? 'Billing Admin'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          title="Sign out of Brightloop"
          style={{
            color: 'var(--color-text-secondary)',
            padding: '5px',
            borderRadius: 'var(--radius-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-overdue-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
