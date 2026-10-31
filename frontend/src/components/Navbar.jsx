import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const routeTitleMap = {
  '/': 'Overview',
  '/products': 'Products',
  '/plans': 'Plans',
  '/subscriptions': 'Subscriptions',
  '/quotations': 'Quotations',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/discounts': 'Discounts',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const currentTitle = routeTitleMap[location.pathname] || 'Dashboard';

  return (
    <header className="layout-navbar">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="mobile-nav-toggle btn-icon"
        >
          <Menu size={18} />
        </button>

        {/* Clean Fintech Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-regular)',
            }}
          >
            Dashboard
          </span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>/</span>
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-main)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Middle: Compact Search Field */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          maxWidth: '360px',
          width: '100%',
          margin: '0 var(--space-4)',
        }}
        className="navbar-search-desktop"
      >
        <div className="search-input-wrapper" style={{ width: '100%' }}>
          <Search size={15} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search subscriptions, invoices, customers..."
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn-icon"
          title="Help & Documentation"
          aria-label="Help"
        >
          <HelpCircle size={17} />
        </button>

        <button
          type="button"
          className="btn-icon"
          title="Messages"
          aria-label="Messages"
        >
          <MessageSquare size={17} />
        </button>

        <button
          type="button"
          className="btn-icon"
          title="Notifications"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={17} />
          {/* Subtle emerald notification dot */}
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </button>

        <div
          style={{
            height: '22px',
            width: '1px',
            backgroundColor: 'var(--color-border)',
            margin: '0 var(--space-1)',
          }}
        />

        {/* User Profile Pill / Dropdown */}
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 6px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color 0.15s ease',
          }}
          className="user-profile-trigger"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-green)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            RV
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-main)',
              display: 'none',
            }}
            className="navbar-username"
          >
            Rohith V P
          </span>
          <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
