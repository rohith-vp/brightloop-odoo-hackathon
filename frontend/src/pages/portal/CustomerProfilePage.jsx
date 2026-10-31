import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { customerService } from '../../services/customerService.js';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { uiUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = () => {
    const user = uiUser;
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const cust = customerService.getMyProfile();
    if (cust) {
      setCustomer(cust);
      setName(cust.name || '');
      setContactPerson(cust.contactPerson || '');
      setEmail(cust.email || user.email || '');
      setPhone(cust.phone || '');
      setGstin(cust.gstin || '');

      const addr = cust.billingAddress || {};
      setStreet(addr.street || '');
      setCity(addr.city || '');
      setState(addr.state || '');
      setPostalCode(addr.postalCode || '');
      setCountry(addr.country || 'India');
    }
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  if (!currentUser || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const updated = customerService.updateMyProfile({
        name,
        contactPerson,
        phone,
        company: customer.company || name,
        gstin,
        billingAddress: {
          street,
          city,
          state,
          postalCode,
          country,
        },
      });

      setCustomer(updated);
      setIsSaving(false);
      setSuccessMessage('Your profile and billing address have been updated successfully.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to save profile changes.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              letterSpacing: '-0.02em',
            }}
          >
            Organization & Account Profile
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Manage your contact credentials, organization billing details, and postal dispatch address.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="card-surface" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
        {/* Section 1: Organization Details */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginBottom: 'var(--space-4)' }}>
            1. Organization & Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                Organization Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-focus"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                Primary Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="input-focus"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                Registered Email Address (Login ID)
              </label>
              <input
                type="email"
                value={email}
                disabled
                title="Email address is tied to your login identity and cannot be altered directly."
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#F3F4F6',
                  color: 'var(--color-text-secondary)',
                  cursor: 'not-allowed',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
                Contact Brightloop Support to transfer account ownership.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-focus"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="input-focus"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Billing & Postal Address */}
        <div style={{ marginBottom: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)', marginBottom: 'var(--space-4)' }}>
            2. Official Billing & Invoicing Address
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                Street Address <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="input-focus"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                  City <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--font-size-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                  State <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--font-size-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                  Postal Code (PIN) <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--font-size-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-form-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--font-size-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: '140px', justifyContent: 'center' }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

