/**
 * Products Mock Service Layer
 * Structured for future REST API integration with localStorage persistence.
 */

const STORAGE_KEY = 'brightloop_products_data';

export const PRODUCT_TYPES = [
  'Software / SaaS',
  'Service',
  'Hardware',
  'Integration Add-on',
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Odoo Subscription Connector',
    type: 'Integration Add-on',
    salesPrice: 4999,
    costPrice: 1500,
    status: 'active',
    notes: 'Bi-directional sync bridge between Brightloop and Odoo 17/18 community & enterprise instances.',
    variants: [
      {
        id: 'var_101',
        name: 'Odoo Enterprise Sync Module',
        additionalPrice: 560, // Specifically requested sample variant
        status: 'active',
      },
      {
        id: 'var_102',
        name: 'Automated Invoice Webhook Extension',
        additionalPrice: 850,
        status: 'active',
      },
    ],
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-30T14:20:00Z',
  },
  {
    id: 'prod_2',
    name: 'Cloud Infrastructure Monitoring Daemon',
    type: 'Software / SaaS',
    salesPrice: 3499,
    costPrice: 900,
    status: 'active',
    notes: 'Lightweight agent capturing system metrics, database health, and subscription latency.',
    variants: [
      {
        id: 'var_201',
        name: 'Standard Single Node',
        additionalPrice: 0,
        status: 'active',
      },
      {
        id: 'var_202',
        name: 'Multi-Region High Availability Cluster',
        additionalPrice: 1400,
        status: 'active',
      },
    ],
    createdAt: '2026-10-18T11:30:00Z',
    updatedAt: '2026-10-28T16:45:00Z',
  },
  {
    id: 'prod_3',
    name: 'Dedicated Technical Account Manager',
    type: 'Service',
    salesPrice: 12000,
    costPrice: 6500,
    status: 'active',
    notes: 'Direct 24/7 priority SLA support, quarterly business reviews, and custom migration support.',
    variants: [
      {
        id: 'var_301',
        name: 'Standard (8x5 Phone & Slack)',
        additionalPrice: 0,
        status: 'active',
      },
      {
        id: 'var_302',
        name: 'Enterprise 24x7 Critical Response (<15 min)',
        additionalPrice: 3500,
        status: 'active',
      },
    ],
    createdAt: '2026-10-20T14:15:00Z',
    updatedAt: '2026-10-29T10:00:00Z',
  },
  {
    id: 'prod_4',
    name: 'Smart Billing POS Terminal v2',
    type: 'Hardware',
    salesPrice: 8500,
    costPrice: 4800,
    status: 'active',
    notes: 'Physical NFC-enabled card reader and UPI QR countertop display with integrated receipt printer.',
    variants: [
      {
        id: 'var_401',
        name: 'Wi-Fi / Ethernet Model',
        additionalPrice: 0,
        status: 'active',
      },
      {
        id: 'var_402',
        name: '4G Cellular Backup eSIM Included',
        additionalPrice: 950,
        status: 'active',
      },
    ],
    createdAt: '2026-10-22T08:45:00Z',
    updatedAt: '2026-10-31T09:15:00Z',
  },
  {
    id: 'prod_5',
    name: 'Legacy SMS Gateway Adapter',
    type: 'Integration Add-on',
    salesPrice: 1800,
    costPrice: 600,
    status: 'inactive',
    notes: 'Deprecated transactional SMS provider adapter. Retained for older contract renewals.',
    variants: [],
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-10-15T09:30:00Z',
  },
];

function loadStoredProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading products from localStorage:', err);
    return INITIAL_PRODUCTS;
  }
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed saving products to localStorage:', err);
  }
}

export const productService = {
  getProducts() {
    return loadStoredProducts();
  },

  getProductById(id) {
    const list = loadStoredProducts();
    return list.find((p) => p.id === id) || null;
  },

  createProduct(data) {
    const list = loadStoredProducts();
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: data.name.trim(),
      type: data.type || PRODUCT_TYPES[0],
      salesPrice: Number(data.salesPrice) || 0,
      costPrice: Number(data.costPrice) || 0,
      status: data.status || 'active',
      notes: data.notes ? data.notes.trim() : '',
      variants: Array.isArray(data.variants)
        ? data.variants.map((v, i) => ({
            id: v.id || `var_${Date.now()}_${i}`,
            name: v.name.trim(),
            additionalPrice: Number(v.additionalPrice) || 0,
            status: v.status || 'active',
          }))
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...list];
    saveStoredProducts(updated);
    return newProduct;
  },

  updateProduct(id, data) {
    const list = loadStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updatedProduct = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      type: data.type || existing.type,
      salesPrice: data.salesPrice !== undefined ? Number(data.salesPrice) : existing.salesPrice,
      costPrice: data.costPrice !== undefined ? Number(data.costPrice) : existing.costPrice,
      status: data.status || existing.status,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      variants: Array.isArray(data.variants)
        ? data.variants.map((v, i) => ({
            id: v.id || `var_${Date.now()}_${i}`,
            name: v.name.trim(),
            additionalPrice: Number(v.additionalPrice) || 0,
            status: v.status || 'active',
          }))
        : existing.variants,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedProduct;
    saveStoredProducts(list);
    return updatedProduct;
  },

  deleteProduct(id) {
    const list = loadStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProducts(filtered);
    return true;
  },

  resetDefaults() {
    saveStoredProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  formatCurrency(value) {
    const num = Number(value) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  },
};

