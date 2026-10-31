import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Sliders,
  Users,
  CheckCircle2,
  Save,
  RotateCcw,
  Shield,
  Bell,
  Mail,
  MapPin,
} from 'lucide-react';
import { settingsService } from '../services/settingsService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization'); // 'organization' | 'billing' | 'subscriptions' | 'team'
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [teamMembers, setTeamMembers] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setSettings(settingsService.getSettings());
    // Load team users from mock auth system
    const users = [
      { id: 'usr_admin', name: 'System Administrator', email: 'admin@brightloop.io', role: 'admin', status: 'Active' },
      { id: 'usr_staff_1', name: 'Finance Lead (Priya Nair)', email: 'staff@brightloop.io', role: 'staff', status: 'Active' },
      { id: 'usr_staff_2', name: 'Billing Operations', email: 'billing.ops@brightloop.io', role: 'staff', status: 'Active' },
    ];
    setTeamMembers(users);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    settingsService.updateSettings(settings);
    showToast('System configuration saved successfully.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all system settings back to factory defaults?')) {
      const def = settingsService.resetToDefaults();
      setSettings(def);
      showToast('Settings reset to system defaults.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            System & Organization Settings
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Configure organization legal details, default tax rates, invoice prefixes, and subscription policies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'organization', label: 'Organization Profile', icon: Building2 },
          { id: 'billing', label: 'Billing & Invoicing', icon: CreditCard },
          { id: 'subscriptions', label: 'Subscription Policies', icon: Sliders },
          { id: 'team', label: 'Team & Staff Roles', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORGANIZATION PROFILE */}
      {activeTab === 'organization' && (
        <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '16px' }}>
            Company Legal & Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Display Company Name
              </label>
              <input
                type="text"
                value={settings.organization?.companyName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, companyName: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Legal Registered Entity
              </label>
              <input
                type="text"
                value={settings.organization?.legalName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, legalName: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Support & Inquiries Email
              </label>
              <input
                type="email"
                value={settings.organization?.supportEmail || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, supportEmail: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Support Phone Number
              </label>
              <input
                type="text"
                value={settings.organization?.phone || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, phone: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Company GSTIN
              </label>
              <input
                type="text"
                value={settings.organization?.gstin || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, gstin: e.target.value.toUpperCase() },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                PAN Number
              </label>
              <input
                type="text"
                value={settings.organization?.panNumber || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: { ...settings.organization, panNumber: e.target.value.toUpperCase() },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '12px' }}>
            Registered Office Address
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Building, Tech Park, Street"
              value={settings.organization?.address?.street || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  organization: {
                    ...settings.organization,
                    address: { ...settings.organization.address, street: e.target.value },
                  },
                })
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-secondary)',
                fontSize: '14px',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="City"
                value={settings.organization?.address?.city || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: {
                      ...settings.organization,
                      address: { ...settings.organization.address, city: e.target.value },
                    },
                  })
                }
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                placeholder="State"
                value={settings.organization?.address?.state || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: {
                      ...settings.organization,
                      address: { ...settings.organization.address, state: e.target.value },
                    },
                  })
                }
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                placeholder="Postal Code / PIN"
                value={settings.organization?.address?.postalCode || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    organization: {
                      ...settings.organization,
                      address: { ...settings.organization.address, postalCode: e.target.value },
                    },
                  })
                }
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BILLING & INVOICING */}
      {activeTab === 'billing' && (
        <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '16px' }}>
            Tax, Currency & Numbering Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                System Currency
              </label>
              <input
                type="text"
                disabled
                value="INR (₹) - Indian Rupee"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Default GST Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.billing?.defaultTaxRate || 18}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: { ...settings.billing, defaultTaxRate: Number(e.target.value) },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Payment Due Window (Days)
              </label>
              <input
                type="number"
                value={settings.billing?.defaultPaymentTermsDays || 15}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: { ...settings.billing, defaultPaymentTermsDays: Number(e.target.value) },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={settings.billing?.invoicePrefix || 'INV-'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: { ...settings.billing, invoicePrefix: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Quotation Number Prefix
              </label>
              <input
                type="text"
                value={settings.billing?.quotationPrefix || 'QT-'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: { ...settings.billing, quotationPrefix: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Subscription Number Prefix
              </label>
              <input
                type="text"
                value={settings.billing?.subscriptionPrefix || 'SUB-'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: { ...settings.billing, subscriptionPrefix: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-secondary)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION POLICIES */}
      {activeTab === 'subscriptions' && (
        <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '16px' }}>
            Subscription Lifecycle & Self-Service Privileges
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '14px' }}>
                  Auto-close Expired Subscriptions
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Automatically move subscriptions from Active to Closed once the end date passes.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.subscriptions?.autoCloseExpired || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptions: { ...settings.subscriptions, autoCloseExpired: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '14px' }}>
                  Customer Portal: Allow Hold / Pause Requests
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Enable customers to request a temporary hold from the customer portal (requires admin approval).
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.subscriptions?.allowCustomerPauseRequests ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptions: { ...settings.subscriptions, allowCustomerPauseRequests: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '14px' }}>
                  Customer Portal: Allow Cancellation Requests
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Enable customers to submit cancellation requests for administrative review.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.subscriptions?.allowCustomerCancelRequests ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptions: { ...settings.subscriptions, allowCustomerCancelRequests: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM & STAFF */}
      {activeTab === 'team' && (
        <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', margin: 0 }}>
                Authorized Staff Members & Roles
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                Team accounts with administrative access to Brightloop management console.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>Staff Name</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Assigned Role</th>
                  <th style={{ padding: '10px 12px' }}>Access Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {member.name}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>
                      {member.email}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: member.role === 'admin' ? '#EEF2FF' : '#F1F5F9',
                          color: member.role === 'admin' ? '#4F46E5' : '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

