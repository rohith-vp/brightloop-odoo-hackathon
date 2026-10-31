/**
 * Authentication & Role-Based Access Control Mock Service
 * Supports Admin, Staff, and Customer roles with localStorage persistence
 * and customer-scoped data isolation.
 */

import { customerService } from './customerService.js';

const AUTH_STORAGE_KEY = 'brightloop_auth_user';

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

export const MOCK_USERS = [
  {
    id: 'usr_admin_1',
    email: 'admin@brightloop.io',
    password: 'Password@123',
    name: 'Rohith V P',
    role: USER_ROLES.ADMIN,
    title: 'System Administrator',
    avatar: 'RV',
    customerId: null,
  },
  {
    id: 'usr_staff_1',
    email: 'staff@brightloop.io',
    password: 'Password@123',
    name: 'Operations Lead',
    role: USER_ROLES.STAFF,
    title: 'Billing & Ops Specialist',
    avatar: 'OL',
    customerId: null,
  },
  {
    id: 'usr_cust_1',
    email: 'ananya@techcorp.io',
    password: 'Password@123',
    name: 'Ananya Sharma',
    role: USER_ROLES.CUSTOMER,
    company: 'TechCorp Solutions Pvt Ltd',
    title: 'Finance & Subscriptions Manager',
    avatar: 'AS',
    customerId: 'cust_1',
  },
  {
    id: 'usr_cust_2',
    email: 'vikram.roy@nexusfin.com',
    password: 'Password@123',
    name: 'Vikramaditya Roy',
    role: USER_ROLES.CUSTOMER,
    company: 'Nexus FinTech Enterprises',
    title: 'CTO & Infrastructure Lead',
    avatar: 'VR',
    customerId: 'cust_2',
  },
  {
    id: 'usr_cust_3',
    email: 'kavita@omniretail.in',
    password: 'Password@123',
    name: 'Kavita Menon',
    role: USER_ROLES.CUSTOMER,
    company: 'OmniRetail Hypermarkets India',
    title: 'Procurement Director',
    avatar: 'KM',
    customerId: 'cust_3',
  },
  {
    id: 'usr_cust_5',
    email: 'suresh@alphalogistics.in',
    password: 'Password@123',
    name: 'Suresh Patel',
    role: USER_ROLES.CUSTOMER,
    company: 'Alpha Freight & Logistics',
    title: 'Operations Head',
    avatar: 'SP',
    customerId: 'cust_5',
  },
  {
    id: 'usr_cust_a',
    email: 'alice@example.com',
    password: 'Password@123',
    name: 'Alice',
    role: USER_ROLES.CUSTOMER,
    company: 'Alice Enterprises',
    title: 'Managing Director',
    avatar: 'AL',
    customerId: 'CUST001',
  },
  {
    id: 'usr_cust_b',
    email: 'bob@example.com',
    password: 'Password@123',
    name: 'Bob',
    role: USER_ROLES.CUSTOMER,
    company: 'Bob Retail Logistics',
    title: 'Head of Purchasing',
    avatar: 'BO',
    customerId: 'CUST002',
  },
  {
    id: 'usr_cust_c',
    email: 'charlie@example.com',
    password: 'Password@123',
    name: 'Charlie',
    role: USER_ROLES.CUSTOMER,
    company: 'Charlie Tech Labs',
    title: 'Principal Architect',
    avatar: 'CH',
    customerId: 'CUST003',
  },
];

class AuthService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    // Keep session storage initialized
  }

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Storage fallback
    }
  }

  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      if (password && user.password && user.password !== password) {
        throw new Error('Invalid email or password.');
      }
      this.setCurrentUser(user);
      return {
        success: true,
        user,
        redirectUrl: user.role === USER_ROLES.CUSTOMER ? '/portal' : '/',
      };
    }

    // Check if email matches any customer record
    const customers = customerService.getCustomers();
    const matchedCust = customers.find((c) => c.email && c.email.toLowerCase() === cleanEmail);
    if (matchedCust) {
      if (password && password !== 'Password@123') {
        throw new Error('Invalid email or password.');
      }
      const dynamicUser = {
        id: `usr_${matchedCust.id}`,
        email: matchedCust.email,
        name: matchedCust.contactPerson || matchedCust.name,
        role: USER_ROLES.CUSTOMER,
        company: matchedCust.name,
        title: 'Account Representative',
        avatar: (matchedCust.contactPerson || matchedCust.name).slice(0, 2).toUpperCase(),
        customerId: matchedCust.id,
      };
      this.setCurrentUser(dynamicUser);
      return {
        success: true,
        user: dynamicUser,
        redirectUrl: '/portal',
      };
    }

    throw new Error('Invalid email or password.');
  }

  logout() {
    this.setCurrentUser(null);
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  isCustomer() {
    const user = this.getCurrentUser();
    return user?.role === USER_ROLES.CUSTOMER;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === USER_ROLES.ADMIN;
  }

  isStaff() {
    const user = this.getCurrentUser();
    return user?.role === USER_ROLES.STAFF || user?.role === USER_ROLES.ADMIN;
  }

  getCustomerId() {
    const user = this.getCurrentUser();
    return user?.role === USER_ROLES.CUSTOMER ? user.customerId : null;
  }

  switchAccount(userOrEmail) {
    const target = typeof userOrEmail === 'string'
      ? MOCK_USERS.find((u) => u.email.toLowerCase() === userOrEmail.toLowerCase())
      : userOrEmail;

    if (target) {
      this.setCurrentUser(target);
      return target;
    }
    return null;
  }
}

export const authService = new AuthService();
