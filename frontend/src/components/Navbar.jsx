import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

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
  const navigate = useNavigate();
  const currentTitle = routeTitleMap[location.pathname] || 'Dashboard';
  const { logout, uiUser } = useAuth();
  const currentUser = uiUser || { name: 'Admin', avatar: 'RV' };

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
          <Menu size={20} />
        </button>

        {/* Clean Fintech Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: 'var(--font-size-navbar)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-regular)',
            }}
          >
            Dashboard
          </span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>/</span>
          <span
            style={{
              fontSize: 'var(--font-size-navbar)',
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
          maxWidth: '380px',
          width: '100%',
          margin: '0 var(--space-4)',
        }}
        className="navbar-search-desktop"
      >
        <div className="search-input-wrapper" style={{ width: '100%', minHeight: '38px', padding: '6px 12px' }}>
          <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search subscriptions, invoices, customers..."
            style={{ fontSize: '14px' }}
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
          <HelpCircle size={18} />
        </button>

        <button
          type="button"
          className="btn-icon"
          title="Messages"
          aria-label="Messages"
        >
          <MessageSquare size={18} />
        </button>

        <button
          type="button"
          className="btn-icon"
          title="Notifications"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {/* Subtle emerald notification dot */}
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </button>

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--color-border)',
            margin: '0 var(--space-2)',
          }}
        />

        {/* Customer Portal Quick Link for Evaluators */}
        <button
          type="button"
          onClick={() => navigate('/portal')}
          className="btn btn-secondary"
          title="Open Customer Portal View"
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--color-primary)',
          }}
        >
          <span>Customer Portal</span>
          <ExternalLink size={13} />
        </button>

        {/* User Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-green)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentUser.avatar || 'RV'}
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn-icon"
            title="Sign out of admin console"
            style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
