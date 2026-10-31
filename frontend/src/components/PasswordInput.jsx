import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  error = '',
  disabled = false,
  autoComplete = 'current-password',
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          height: '46px',
          padding: '10px 42px 10px 14px',
          fontSize: 'var(--font-size-input)',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-main)',
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--status-overdue-text)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxSizing: 'border-box',
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
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        disabled={disabled}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          color: 'var(--color-text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: 'var(--radius-xs)',
        }}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
