import { session } from './session.js';
/**
 * Customers Mock Service Layer
 * Centralized customer directory for Brightloop Quotations and Subscriptions.
 */

const STORAGE_KEY = 'brightloop_customers_data';

// Profile shape for a signed-in account that has no customer record yet.
function accountProfile(user) {
  return {
    id: user.id,
    name: user.name,
    contactPerson: user.name,
    email: user.email,
    phone: '',
    company: '',
    gstin: '',
    billingAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    status: 'active',
    createdAt: null,
  };
}

const INITIAL_CUSTOMERS = [
  {
    id: 'cust_1',
    name: 'TechCorp Solutions Pvt Ltd',
    contactPerson: 'Ananya Sharma',
    email: 'ananya@techcorp.io',
    phone: '+91 98201 44521',
    company: 'TechCorp Solutions',
    gstin: '27AABCT3421K1ZZ',
    billingAddress: {
      street: 'Tower B, 7th Floor, Mindspace IT Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400064',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cust_2',
    name: 'Nexus FinTech Enterprises',
    contactPerson: 'Vikramaditya Roy',
    email: 'vikram.roy@nexusfin.com',
    phone: '+91 91673 88204',
    company: 'Nexus FinTech',
    gstin: '29AAACN8912P1ZN',
    billingAddress: {
      street: '42 Prestige Tech Cloud, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-02-14T11:30:00Z',
  },
  {
    id: 'cust_3',
    name: 'Acme Retail Chain Networks',
    contactPerson: 'Rajesh K. Verma',
    email: 'rajesh.verma@acmeretail.in',
    phone: '+91 98112 34900',
    company: 'Acme Retail Group',
    gstin: '07AAACA1123D1ZX',
    billingAddress: {
      street: 'Plot 18, Udyog Vihar Phase 4',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122016',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'cust_4',
    name: 'Zenith Cloud Labs',
    contactPerson: 'Priyanka Iyer',
    email: 'priyanka@zenithcloud.co',
    phone: '+91 94451 77332',
    company: 'Zenith Labs Inc.',
    gstin: '33AABFZ8832L1Z4',
    billingAddress: {
      street: 'Olympia Tech Park, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600032',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-03-18T14:45:00Z',
  },
  {
    id: 'cust_5',
    name: 'Alpha Freight & Logistics',
    contactPerson: 'Suresh Patel',
    email: 'suresh@alphalogistics.in',
    phone: '+91 98790 12045',
    company: 'Alpha Freight Systems',
    gstin: '24AAACT7721N1ZM',
    billingAddress: {
      street: 'Near Logistics Hub, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-04-05T16:20:00Z',
  },
  {
    id: 'CUST001',
    name: 'Alice',
    contactPerson: 'Alice Henderson',
    email: 'alice@example.com',
    phone: '+91 98200 11111',
    company: 'Alice Enterprises',
    gstin: '27AABCA1111A1Z1',
    billingAddress: {
      street: '101 Cyber Heights, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'CUST002',
    name: 'Bob',
    contactPerson: 'Bob Martinez',
    email: 'bob@example.com',
    phone: '+91 98200 22222',
    company: 'Bob Retail Logistics',
    gstin: '29AABCB2222B1Z2',
    billingAddress: {
      street: '202 Industrial Suburb, Peenya',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560058',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'CUST003',
    name: 'Charlie',
    contactPerson: 'Charlie Tan',
    email: 'charlie@example.com',
    phone: '+91 98200 33333',
    company: 'Charlie Tech Labs',
    gstin: '33AABCC3333C1Z3',
    billingAddress: {
      street: '303 Tidel Park, Rajiv Gandhi Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600113',
      country: 'India',
    },
    status: 'active',
    createdAt: '2026-01-03T00:00:00Z',
  },
];

class CustomerService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      }
    } catch {
      // In case of SSR or sandbox restrictions
    }
  }

  getCustomers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  getCustomerById(id) {
    const customers = this.getCustomers();
    return customers.find((c) => c.id === id) || null;
  }

  getCustomerByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const customers = this.getCustomers();
    return customers.find((c) => c.email && c.email.toLowerCase() === clean) || null;
  }

  createCustomer(customerData) {
    const customers = this.getCustomers();
    const newCustomer = {
      id: `cust_${Date.now()}`,
      ...customerData,
      status: customerData.status || 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    this.saveCustomers(updated);
    return newCustomer;
  }

  updateCustomer(id, customerData) {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    customers[index] = {
      ...customers[index],
      ...customerData,
      updatedAt: new Date().toISOString(),
    };
    this.saveCustomers(customers);
    return customers[index];
  }

  getAuthenticatedUser() {
    return session.get();
  }

  getAuthenticatedCustomerId() {
    const user = this.getAuthenticatedUser();
    return user?.role === 'customer' ? user.customerId : null;
  }

  getMyProfile() {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    if (user.role !== 'customer') {
      // If admin/staff is previewing portal, fall back to selected/default customer
      const fallbackId = user.customerId || 'CUST001';
      return this.getCustomerById(fallbackId);
    }
    // A real account is not linked to a customer record yet. Show the account's own details.
    const customer = user.customerId ? this.getCustomerById(user.customerId) : null;
    return customer ?? accountProfile(user);
  }

  updateMyProfile(permittedData = {}) {
    const user = this.getAuthenticatedUser();
    if (!user) throw new Error('Unauthorized: No active session.');
    if (user.role !== 'customer') {
      throw new Error('Access denied: Only customer accounts can update their customer profile through this endpoint.');
    }

    // A real account has no customer record yet, so there is nothing to update.
    // Writing with a missing ID would create a stray record in the shared store.
    if (!user.customerId) {
      throw new Error('Profile changes are not available for this account yet.');
    }

    // Security: Disallow tampering with ID, role, or email
    const safeData = {};
    if (permittedData.name !== undefined) safeData.name = permittedData.name;
    if (permittedData.contactPerson !== undefined) safeData.contactPerson = permittedData.contactPerson;
    if (permittedData.phone !== undefined) safeData.phone = permittedData.phone;
    if (permittedData.company !== undefined) safeData.company = permittedData.company;
    if (permittedData.gstin !== undefined) safeData.gstin = permittedData.gstin;
    if (permittedData.billingAddress !== undefined) safeData.billingAddress = permittedData.billingAddress;

    return this.updateCustomer(user.customerId, safeData);
  }

  deleteCustomer(id) {
    const customers = this.getCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    this.saveCustomers(filtered);
    return true;
  }

  saveCustomers(customers) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch {
      // Fallback
    }
  }
}

export const customerService = new CustomerService();

