import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { Loader2, AlertCircle, CheckCircle2, Check } from 'lucide-react';

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

  // Dynamic password criteria validation
  const passwordCriteria = [
    {
      id: 'length',
      label: 'Minimum 8 characters',
      valid: formData.password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      valid: /[A-Z]/.test(formData.password),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      valid: /[a-z]/.test(formData.password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    },
  ];

  const allCriteriaMet = passwordCriteria.every((c) => c.valid);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid work email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!allCriteriaMet) {
      newErrors.password = 'Please satisfy all password criteria';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    // Simulated registration
    setTimeout(() => {
      setIsLoading(false);
      setSignupSuccess(true);

      // Redirect after showing success feedback
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    }, 850);
  };

  return (
    <div>
      {/* Heading & Supporting text */}
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
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success-text)',
            fontSize: 'var(--font-size-body)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Account created successfully! Redirecting to sign in...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-form-label)',
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
            placeholder="Alex Morgan"
            disabled={isLoading || signupSuccess}
            style={{
              width: '100%',
              height: '46px',
              padding: '10px 14px',
              fontSize: 'var(--font-size-input)',
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
                gap: '5px',
                color: 'var(--status-overdue-text)',
                fontSize: 'var(--font-size-helper)',
                marginTop: '5px',
              }}
            >
              <AlertCircle size={14} />
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
              fontSize: 'var(--font-size-form-label)',
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
            placeholder="alex@company.com"
            disabled={isLoading || signupSuccess}
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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-form-label)',
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

          {/* Password Requirements Checklist */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: '12px 14px',
              backgroundColor: '#FAFCFB',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
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
                  gap: '8px',
                  fontSize: 'var(--font-size-helper)',
                  color: c.valid ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: c.valid ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  transition: 'color 0.15s ease',
                }}
              >
                {c.valid ? (
                  <Check size={16} style={{ color: 'var(--color-primary)', strokeWidth: 2.5 }} />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-border)',
                      margin: '0 5px',
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
              fontSize: 'var(--font-size-form-label)',
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
                gap: '5px',
                color: 'var(--status-overdue-text)',
                fontSize: 'var(--font-size-helper)',
                marginTop: '5px',
              }}
            >
              <AlertCircle size={14} />
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
          fontSize: 'var(--font-size-body)',
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
