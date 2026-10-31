/**
 * Customers Mock Service Layer
 * Centralized customer directory for Brightloop Quotations and Subscriptions.
 */

const STORAGE_KEY = 'brightloop_customers_data';

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

