import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UI_ROLES } from '../auth/uiUser';
import { customerService } from '../services/customerService.js';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [customerRecord, setCustomerRecord] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { uiUser, logout } = useAuth();

  useEffect(() => {
    const user = uiUser;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== UI_ROLES.CUSTOMER) {
      // Staff and admins belong in the console, not the portal.
      navigate('/');
      return;
    }
    setCurrentUser(user);

    // If logged in as customer, fetch customer record
    if (user.customerId) {
      const cust = customerService.getCustomerById(user.customerId);
      setCustomerRecord(cust);
    }
  }, [navigate, uiUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/portal', icon: LayoutDashboard, exact: true },
    { name: 'My Subscriptions', path: '/portal/subscriptions', icon: Repeat },
    { name: 'My Invoices', path: '/portal/invoices', icon: Receipt },
    { name: 'My Payments', path: '/portal/payments', icon: CreditCard },
    { name: 'Profile', path: '/portal/profile', icon: User },
  ];

  if (!currentUser) return null;

  const isAdminViewing = currentUser.role === UI_ROLES.ADMIN || currentUser.role === UI_ROLES.STAFF;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      {/* Admin banner if admin is inspecting customer portal */}
      {isAdminViewing && (
        <div
          style={{
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '8px 24px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{ color: '#38BDF8' }} />
            <span>
              <strong>Admin Mode:</strong> Viewing Customer Portal preview as <em>{currentUser.name}</em>
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              border: 'none',
              padding: '3px 10px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Return to Admin Console</span>
            <ExternalLink size={12} />
          </button>
        </div>
      )}

      {/* Top Customer Portal Navbar */}
      <header
        style={{
          height: '68px',
          backgroundColor: 'var(--color-surface-white)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand & Portal Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            onClick={() => navigate('/portal')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '18px',
              }}
            >
              B
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Brightloop
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Customer Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="customer-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginLeft: 'var(--space-6)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sidebar)',
                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? 'var(--color-surface-green)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Company / Account Info */}
          <div style={{ textAlign: 'right', display: 'none' }} className="customer-header-details">
            <div style={{ fontSize: '13px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
              {customerRecord?.name || currentUser.company || currentUser.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {currentUser.email}
            </div>
          </div>

          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-green)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '13px',
            }}
          >
            {currentUser.avatar || 'CU'}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            title="Sign out of customer portal"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
          >
            <LogOut size={15} />
            <span className="customer-logout-text">Sign out</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon customer-mobile-toggle"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-surface-white)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            zIndex: 49,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-surface-green)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Main Customer Portal Content Area */}
      <main style={{ flex: 1, padding: 'var(--space-6)', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Customer Portal Footer */}
      <footer
        style={{
          padding: 'var(--space-4) var(--space-6)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-white)',
          textAlign: 'center',
          fontSize: 'var(--font-size-helper)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>© 2026 Brightloop Subscription Management. Secured Customer Portal.</span>
      </footer>

      {/* Responsive CSS for Header */}
      <style>{`
        @media (min-width: 768px) {
          .customer-header-details {
            display: block !important;
          }
        }
        @media (max-width: 860px) {
          .customer-desktop-nav {
            display: none !important;
          }
          .customer-mobile-toggle {
            display: flex !important;
          }
          .customer-logout-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

