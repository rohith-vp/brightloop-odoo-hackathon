import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { Loader2, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { authApi, ApiError } from '../services/api';
import { validateSignup, hasErrors, PASSWORD_RULES } from '../lib/validation';
import { Notice } from '../components/forms';

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Live password checklist. The rules are shared with the backend's rules via lib/validation.js.
  const passwordCriteria = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    valid: rule.test(formData.password),
  }));


  const validate = () => {
    const newErrors = validateSignup(formData);
    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.signup({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setIsLoading(false);
      setSignupSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { notice: 'Your account is ready. Sign in to continue.' },
        });
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof ApiError && err.status === 422) {
        // Map server field names onto the form's field names.
        setErrors({
          fullName: err.details.name,
          email: err.details.email,
          password: err.details.password,
        });
      } else if (err instanceof ApiError && err.status === 409) {
        setErrors((prev) => ({ ...prev, email: 'An account with this email already exists' }));
      } else {
        setFormError(err.message);
      }
    }
  };

  return (
    <div>
      {/* Heading & Supporting text */}
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
          Create your account
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Get started with Brightloop Subscription Management.
        </p>
      </div>

      {signupSuccess && (
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
          <span>Account created successfully! Redirecting to sign in...</span>
        </div>
      )}

      {formError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Notice>{formError}</Notice>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-main)',
              marginBottom: '6px',
            }}
          >
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Rohith V P"
            disabled={isLoading || signupSuccess}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-main)',
              backgroundColor: 'var(--color-surface)',
              border: `1px solid ${errors.fullName ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              if (!errors.fullName) e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 1px rgba(8, 122, 75, 0.15)';
            }}
            onBlur={(e) => {
              if (!errors.fullName) e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.fullName && (
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
              <span>{errors.fullName}</span>
            </div>
          )}
        </div>

        {/* Work Email */}
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
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rohith@company.com"
            disabled={isLoading || signupSuccess}
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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-main)',
              marginBottom: '6px',
            }}
          >
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            error={errors.password}
            disabled={isLoading || signupSuccess}
            autoComplete="new-password"
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

          {/* Password Requirements Checklist */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: '10px 12px',
              backgroundColor: '#FAFCFB',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              Password Requirements:
            </span>
            {passwordCriteria.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: c.valid ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: c.valid ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  transition: 'color 0.15s ease',
                }}
              >
                {c.valid ? (
                  <Check size={14} style={{ color: 'var(--color-primary)', strokeWidth: 2.5 }} />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-border)',
                      margin: '0 4px',
                      display: 'inline-block',
                    }}
                  />
                )}
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-main)',
              marginBottom: '6px',
            }}
          >
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            disabled={isLoading || signupSuccess}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
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
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || signupSuccess}
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
          <span>{isLoading ? 'Creating account...' : 'Create Brightloop account'}</span>
        </button>
      </form>

      {/* Link to Login */}
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
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

