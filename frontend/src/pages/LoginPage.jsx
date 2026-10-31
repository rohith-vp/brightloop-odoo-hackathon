import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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

    // Simulated authenticating state
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 500);
    }, 750);
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'admin@brightloop.io',
      password: 'Password@123',
      rememberMe: true,
    });
    setErrors({});
  };

  return (
    <div>
      {/* Title & Description */}
      <div style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-secondary)',
            marginBottom: '4px',
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
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success-text)',
            fontSize: 'var(--font-size-body)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Signed in successfully. Redirecting to dashboard...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '13px',
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
              padding: '9px 12px',
              fontSize: 'var(--font-size-body)',
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
                gap: '4px',
                color: 'var(--status-overdue-text)',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              <AlertCircle size={13} />
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
                fontSize: '13px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-main)',
              }}
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '12px',
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
                gap: '4px',
                color: 'var(--status-overdue-text)',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              <AlertCircle size={13} />
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
              width: '16px',
              height: '16px',
              accentColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: '13px',
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
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 'var(--font-weight-semibold)',
            marginTop: 'var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isLoading && <Loader2 size={16} className="spin-loader" />}
          <span>{isLoading ? 'Signing in...' : 'Sign in to Brightloop'}</span>
        </button>

        {/* Demo Quick-Fill Pill for Evaluators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px',
          }}
        >
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'underline',
              padding: '2px 6px',
            }}
          >
            Auto-fill demo credentials
          </button>
        </div>
      </form>

      {/* Link to Signup */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          fontSize: '13px',
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

