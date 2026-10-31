import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PlansPage from './pages/PlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import DiscountsPage from './pages/DiscountsPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboardPage from './pages/portal/CustomerDashboardPage';
import CustomerSubscriptionsPage from './pages/portal/CustomerSubscriptionsPage';
import CustomerInvoicesPage from './pages/portal/CustomerInvoicesPage';
import CustomerPaymentsPage from './pages/portal/CustomerPaymentsPage';
import CustomerProfilePage from './pages/portal/CustomerProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
          fontSize: 'var(--font-size-badge)',
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
          fontSize: 'var(--font-size-heading-main)',
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

        {/* Customer Portal Shell */}
        <Route path="/portal" element={<RequireAuth><CustomerLayout /></RequireAuth>}>
          <Route index element={<CustomerDashboardPage />} />
          <Route path="subscriptions" element={<CustomerSubscriptionsPage />} />
          <Route path="invoices" element={<CustomerInvoicesPage />} />
          <Route path="payments" element={<CustomerPaymentsPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>

        {/* Protected Dashboard & Management Shell */}
        <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          {/* Main Menu */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />

          {/* Finance */}
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="discounts" element={<DiscountsPage />} />

          {/* Management */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
