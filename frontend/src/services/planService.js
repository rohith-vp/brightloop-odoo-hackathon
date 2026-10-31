/**
 * Plans Mock Service Layer
 * Supports full CRUD, lifecycle configuration, and localStorage persistence.
 */

import { productService } from './productService';

const STORAGE_KEY = 'brightloop_plans_data';

export const BILLING_FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
export const PLAN_STATUSES = ['active', 'inactive', 'expired'];

const INITIAL_PLANS = [
  {
    id: 'plan_1',
    name: 'Odoo Connector - Monthly Business',
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    billingFrequency: 'Monthly',
    price: 4999,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    status: 'active',
    description: 'Standard monthly synchronization plan for Odoo community and enterprise ERP instances.',
    lifecycle: {
      closureMode: 'manual', // 'automatic' | 'manual'
      allowEarlyClosure: true,
      allowPause: true,
      renewalMode: 'auto', // 'auto' | 'manual'
      renewalEnabled: true,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'plan_2',
    name: 'Odoo Connector - Annual Enterprise Suite',
    productId: 'prod_1',
    productName: 'Odoo Subscription Connector',
    billingFrequency: 'Yearly',
    price: 49990,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    status: 'active',
    description: 'Annual multi-instance subscription package with discounted rate and priority webhook delivery.',
    lifecycle: {
      closureMode: 'manual',
      allowEarlyClosure: true,
      allowPause: false,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'plan_3',
    name: 'Cloud Daemon - Growth Tier',
    productId: 'prod_2',
    productName: 'Cloud Infrastructure Monitoring Daemon',
    billingFrequency: 'Monthly',
    price: 3499,
    minQuantity: 2,
    startDate: '2026-03-01',
    endDate: '2027-06-30',
    status: 'active',
    description: 'Per-node real-time infrastructure agent for high throughput subscription monitoring.',
    lifecycle: {
      closureMode: 'manual',
      allowEarlyClosure: true,
      allowPause: true,
      renewalMode: 'auto',
      renewalEnabled: true,
    },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-10-28T16:00:00Z',
  },
  {
    id: 'plan_4',
    name: 'TAM Support Retainer - Weekly Sprint',
    productId: 'prod_3',
    productName: 'Dedicated Technical Account Manager',
    billingFrequency: 'Weekly',
    price: 3200,
    minQuantity: 1,
    startDate: '2026-06-01',
    endDate: '2027-01-31',
    status: 'active',
    description: 'Weekly architectural review and migration sprint assistance.',
    lifecycle: {
      closureMode: 'automatic',
      allowEarlyClosure: false,
      allowPause: true,
      renewalMode: 'manual',
      renewalEnabled: true,
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-10-29T11:20:00Z',
  },
  {
    id: 'plan_5',
    name: 'POS Terminal Daily Hardware Lease',
    productId: 'prod_4',
    productName: 'Smart Billing POS Terminal v2',
    billingFrequency: 'Daily',
    price: 150,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-10-01',
    status: 'expired',
    description: 'Pop-up store daily countertop card terminal lease.',
    lifecycle: {
      closureMode: 'automatic',
      allowEarlyClosure: true,
      allowPause: false,
      renewalMode: 'manual',
      renewalEnabled: false,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'plan_6',
    name: 'Legacy SMS Broadcast Plan',
    productId: 'prod_5',
    productName: 'Legacy SMS Gateway Adapter',
    billingFrequency: 'Monthly',
    price: 1800,
    minQuantity: 5,
    startDate: '2025-01-01',
    endDate: '2026-06-30',
    status: 'inactive',
    description: 'Archived SMS provider rate plan.',
    lifecycle: {
      closureMode: 'manual',
      allowEarlyClosure: true,
      allowPause: false,
      renewalMode: 'manual',
      renewalEnabled: false,
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
];

function loadStoredPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading plans from localStorage:', err);
    return INITIAL_PLANS;
  }
}

function saveStoredPlans(plans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed saving plans to localStorage:', err);
  }
}

export const planService = {
  getPlans() {
    return loadStoredPlans();
  },

  getPlanById(id) {
    const list = loadStoredPlans();
    return list.find((p) => p.id === id) || null;
  },

  createPlan(data) {
    const list = loadStoredPlans();
    const products = productService.getProducts();
    const matchedProduct = products.find((p) => p.id === data.productId);

    const newPlan = {
      id: `plan_${Date.now()}`,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      productId: data.productId,
      productName: matchedProduct ? matchedProduct.name : 'Unknown Product',
      billingFrequency: data.billingFrequency || 'Monthly',
      price: Number(data.price) || 0,
      minQuantity: Math.max(1, Number(data.minQuantity) || 1),
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: data.status || 'active',
      lifecycle: {
        closureMode: data.lifecycle?.closureMode || 'manual',
        allowEarlyClosure: Boolean(data.lifecycle?.allowEarlyClosure ?? true),
        allowPause: Boolean(data.lifecycle?.allowPause ?? true),
        renewalMode: data.lifecycle?.renewalMode || 'auto',
        renewalEnabled: Boolean(data.lifecycle?.renewalEnabled ?? true),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPlan, ...list];
    saveStoredPlans(updated);
    return newPlan;
  },

  updatePlan(id, data) {
    const list = loadStoredPlans();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = list[index];
    let productName = existing.productName;
    if (data.productId && data.productId !== existing.productId) {
      const products = productService.getProducts();
      const matched = products.find((p) => p.id === data.productId);
      if (matched) productName = matched.name;
    }

    const updatedPlan = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      productId: data.productId || existing.productId,
      productName,
      billingFrequency: data.billingFrequency || existing.billingFrequency,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      minQuantity: data.minQuantity !== undefined ? Math.max(1, Number(data.minQuantity)) : existing.minQuantity,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      endDate: data.endDate !== undefined ? data.endDate : existing.endDate,
      status: data.status || existing.status,
      lifecycle: {
        ...existing.lifecycle,
        ...(data.lifecycle || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedPlan;
    saveStoredPlans(list);
    return updatedPlan;
  },

  deletePlan(id) {
    const list = loadStoredPlans();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredPlans(filtered);
    return true;
  },

  resetDefaults() {
    saveStoredPlans(INITIAL_PLANS);
    return INITIAL_PLANS;
  },

  formatCurrency(value) {
    const num = Number(value) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  },
};

