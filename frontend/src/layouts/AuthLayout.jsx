import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      {/* Brand Header */}
      <Link
        to="/login"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          textDecoration: 'none',
        }}
      >
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
            fontSize: '16px',
          }}
        >
          B
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.02em',
              color: 'var(--color-secondary)',
              lineHeight: 1.1,
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
            Subscription Management
          </span>
        </div>
      </Link>

      {/* Main Form Surface */}
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Outlet />
      </div>

      {/* Security & System Trust Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: 'var(--space-6)',
          fontSize: '11px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
        <span>Enterprise-grade 256-bit encryption • SOC2 Type II Certified</span>
      </div>
    </div>
  );
}

