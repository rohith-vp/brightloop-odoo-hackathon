import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../services/api';
import { validateLogin, hasErrors } from '../lib/validation';
import { Notice } from '../components/forms';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const notice = location.state?.notice;
  const destination = location.state?.from ?? '/';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateLogin(formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setFormError('');
    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      setIsLoading(false);
      setLoginSuccess(true);
      setTimeout(() => navigate(destination, { replace: true }), 500);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof ApiError && err.status === 401) {
        setFormError('Invalid email or password.');
      } else if (err instanceof ApiError && err.status === 422) {
        setErrors(err.details);
      } else {
        setFormError(err.message);
      }
    }
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
      {notice && !formError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice tone="success">{notice}</Notice>
        </div>
      )}
      {formError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice>{formError}</Notice>
        </div>
      )}

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

