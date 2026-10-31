import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductsPage from './pages/ProductsPage';
import PlansPage from './pages/PlansPage';
import { AuthProvider, RequireAuth } from './auth/AuthContext';

function PlaceholderPage({ title, description }) {
  return (
    <div
      className="card-surface"
      style={{
        padding: 'var(--space-8)',
        maxWidth: '800px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '4px 10px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--color-surface-green)',
          color: 'var(--color-primary)',
          fontSize: '11px',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--space-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Module Foundation
      </div>
      <h1
        style={{
          fontSize: 'var(--font-size-heading)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-secondary)',
          marginBottom: 'var(--space-2)',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-body)',
          lineHeight: 1.6,
        }}
      >
        {description ||
          'This module foundation is configured and aligned with the centralized fintech design system. Functional workflows will be integrated in Phase 2.'}
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Dashboard & Management Shell */}
        <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          {/* Main Menu */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route
            path="subscriptions"
            element={<PlaceholderPage title="Subscriptions" description="Manage customer subscription contracts, active renewals, upgrades, and cancellations." />}
          />

          {/* Finance */}
          <Route
            path="quotations"
            element={<PlaceholderPage title="Quotations" description="Create, review, and dispatch commercial quotes and subscription estimates." />}
          />
          <Route
            path="invoices"
            element={<PlaceholderPage title="Invoices" description="Automated billing invoices, tax breakdowns, overdue notices, and receipt generation." />}
          />
          <Route
            path="payments"
            element={<PlaceholderPage title="Payments" description="Payment gateway collection records, UPI mandate settlements, and transaction reconciliations." />}
          />
          <Route
            path="discounts"
            element={<PlaceholderPage title="Discounts" description="Promotional coupons, customer-specific concession rules, and seasonal discount campaigns." />}
          />

          {/* Management */}
          <Route
            path="customers"
            element={<PlaceholderPage title="Customers" description="Customer directory, account contacts, billing details, and subscription histories." />}
          />
          <Route
            path="reports"
            element={<PlaceholderPage title="Reports" description="Financial analytics, churn modeling, cohort retention, and MRR growth tracking." />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" description="System configurations, webhook endpoints, payment gateway keys, and organization profiles." />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
