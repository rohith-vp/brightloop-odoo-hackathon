import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { Loader2, AlertCircle, CheckCircle2, Shield, User } from 'lucide-react';
import { authService } from '../services/authService.js';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      try {
        const result = authService.login(formData.email, formData.password);
        setIsLoading(false);
        setLoginSuccess(true);

        setTimeout(() => {
          navigate(result.redirectUrl);
        }, 400);
      } catch (err) {
        setIsLoading(false);
        setErrors({ general: err.message || 'Invalid email or password.' });
      }
    }, 500);
  };

  const handleFillDemo = (type = 'admin') => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@brightloop.io',
        password: 'Password@123',
        rememberMe: true,
      });
    } else if (type === 'customer1') {
      setFormData({
        email: 'ananya@techcorp.io',
        password: 'Password@123',
        rememberMe: true,
      });
    } else if (type === 'customer2') {
      setFormData({
        email: 'vikram.roy@nexusfin.com',
        password: 'Password@123',
        rememberMe: true,
      });
    }
    setErrors({});
  };

  return (
    <div>
      {/* Title & Description */}
      <div style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-heading-main)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-secondary)',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Sign in to manage your subscriptions and billing.
        </p>
      </div>

      {loginSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success-text)',
            fontSize: 'var(--font-size-body)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Signed in successfully. Redirecting to dashboard...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-form-label)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-main)',
              marginBottom: '6px',
            }}
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            disabled={isLoading || loginSuccess}
            style={{
              width: '100%',
              height: '46px',
              padding: '10px 14px',
              fontSize: 'var(--font-size-input)',
              color: 'var(--color-text-main)',
              backgroundColor: 'var(--color-surface)',
              border: `1px solid ${errors.email ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              if (!errors.email) e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 1px rgba(8, 122, 75, 0.15)';
            }}
            onBlur={(e) => {
              if (!errors.email) e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.email && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--status-overdue-text)',
                fontSize: 'var(--font-size-helper)',
                marginTop: '5px',
              }}
            >
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: 'var(--font-size-form-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-main)',
              }}
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 'var(--font-size-helper)',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            disabled={isLoading || loginSuccess}
            autoComplete="current-password"
          />
          {errors.password && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--status-overdue-text)',
                fontSize: 'var(--font-size-helper)',
                marginTop: '5px',
              }}
            >
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isLoading || loginSuccess}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Remember this device for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || loginSuccess}
          style={{
            width: '100%',
            height: '46px',
            padding: '10px 16px',
            fontSize: 'var(--font-size-button)',
            fontWeight: 'var(--font-weight-semibold)',
            marginTop: 'var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isLoading && <Loader2 size={18} className="spin-loader" />}
          <span>{isLoading ? 'Signing in...' : 'Sign in to Brightloop'}</span>
        </button>

        {/* Demo Quick-Fill Pill for Evaluators */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-green)',
            border: '1px solid rgba(8, 122, 75, 0.15)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
            Quick Demo Login:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Admin (admin@brightloop.io)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('customer1')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Customer: TechCorp
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('customer2')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Customer: Nexus FinTech
            </button>
          </div>
        </div>
      </form>

      {/* Link to Signup */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Don't have an account?{' '}
        <Link
          to="/signup"
          style={{
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
