/**
 * Settings Service
 * Manages system preferences, organization identity, billing configurations, and portal policies.
 */

const STORAGE_KEY = 'brightloop_system_settings';

const DEFAULT_SETTINGS = {
  organization: {
    companyName: 'Brightloop Technologies Pvt Ltd',
    legalName: 'Brightloop Technologies India Private Limited',
    supportEmail: 'support@brightloop.io',
    billingEmail: 'billing@brightloop.io',
    phone: '+91 80 4912 3000',
    website: 'https://brightloop.io',
    gstin: '27AABCB1234F1Z8',
    panNumber: 'AABCB1234F',
    address: {
      street: 'Tower B, 7th Floor, Mindspace IT Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400064',
      country: 'India',
    },
  },
  billing: {
    defaultCurrency: 'INR (₹)',
    currencySymbol: '₹',
    defaultTaxRate: 18, // 18% GST
    taxLabel: 'GST',
    defaultPaymentTermsDays: 15, // Net 15
    invoicePrefix: 'INV-',
    quotationPrefix: 'QT-',
    subscriptionPrefix: 'SUB-',
    paymentPrefix: 'PAY-',
    allowPartialPayments: true,
  },
  subscriptions: {
    gracePeriodDays: 7,
    autoCloseExpired: true,
    allowCustomerPauseRequests: true,
    allowCustomerCancelRequests: true,
    defaultRenewalTerm: 'auto_renew',
  },
  notifications: {
    emailOnInvoiceGenerated: true,
    emailOnPaymentReceived: true,
    renewalReminderDaysBefore: 7,
    overdueAlertsEnabled: true,
  },
};

class SettingsService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch {
      // In case of sandbox or SSR
    }
  }

  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(partialSettings) {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...partialSettings,
      organization: {
        ...current.organization,
        ...(partialSettings.organization || {}),
        address: {
          ...current.organization.address,
          ...(partialSettings.organization?.address || {}),
        },
      },
      billing: {
        ...current.billing,
        ...(partialSettings.billing || {}),
      },
      subscriptions: {
        ...current.subscriptions,
        ...(partialSettings.subscriptions || {}),
      },
      notifications: {
        ...current.notifications,
        ...(partialSettings.notifications || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fallback
    }

    return updated;
  }

  resetToDefaults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  }
}

export const settingsService = new SettingsService();

