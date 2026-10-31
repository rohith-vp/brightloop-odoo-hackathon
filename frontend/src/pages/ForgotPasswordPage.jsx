import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulated API dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div>
      {/* Back button */}
      <Link
        to="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-secondary)',
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to sign in</span>
      </Link>

      {isSubmitted ? (
        /* Success State */
        <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <Mail size={26} />
          </div>

          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            Check your email
          </h1>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-body)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            We have sent a password reset link to{' '}
            <strong style={{ color: 'var(--color-text-main)' }}>{email}</strong>.
            Please follow the instructions in the email to reset your password.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                padding: '10px 16px',
                fontSize: 'var(--font-size-button)',
                fontWeight: 'var(--font-weight-semibold)',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              Return to sign in
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '44px',
                padding: '9px 16px',
                fontSize: 'var(--font-size-body)',
              }}
            >
              {isLoading ? 'Resending...' : "Didn't receive email? Resend link"}
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <div>
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
              Forgot your password?
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
              Enter your registered work email and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                Work email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@company.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '10px 14px',
                  fontSize: 'var(--font-size-input)',
                  color: 'var(--color-text-main)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${error ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 1px rgba(8, 122, 75, 0.15)';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {error && (
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
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
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
              <span>{isLoading ? 'Sending reset link...' : 'Send reset link'}</span>
            </button>
          </form>

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
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
