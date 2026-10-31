/**
 * Discounts Mock Service Layer
 * Supports fixed amount & percentage discounts, applicability scopes,
 * usage limits, date validations, and automatic eligibility evaluations.
 */

import { planService } from './planService.js';

const STORAGE_KEY = 'brightloop_discounts_data';

export const DISCOUNT_TYPES = ['percentage', 'fixed'];
export const DISCOUNT_APPLICABILITIES = ['all', 'specific_products', 'specific_subscriptions'];

const INITIAL_DISCOUNTS = [
  {
    id: 'disc_1',
    name: 'Diwali Festive Enterprise Concession',
    code: 'FESTIVE15',
    description: '15% concession for enterprise cloud and connector subscription renewals.',
    type: 'percentage',
    value: 15,
    minPurchaseAmount: 10000,
    minQuantity: 1,
    validFrom: '2026-10-15',
    validUntil: '2026-11-30',
    maxUsageLimit: 50,
    usageCount: 12,
    applicability: 'all',
    applicableProductIds: [],
    applicableSubscriptionIds: [],
    status: 'active',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'disc_2',
    name: 'Hardware Terminal Starter Concession',
    code: 'POSSTART500',
    description: '₹500 flat concession on POS device subscriptions.',
    type: 'fixed',
    value: 500,
    minPurchaseAmount: 1500,
    minQuantity: 1,
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
    maxUsageLimit: 100,
    usageCount: 28,
    applicability: 'specific_products',
    applicableProductIds: ['prod_4'],
    applicableSubscriptionIds: [],
    status: 'active',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'disc_3',
    name: 'Q3 Cloud Growth Special',
    code: 'GROWTH1000',
    description: 'Flat ₹1,000 concession for high-throughput cloud monitoring clusters.',
    type: 'fixed',
    value: 1000,
    minPurchaseAmount: 5000,
    minQuantity: 2,
    validFrom: '2026-07-01',
    validUntil: '2026-09-30',
    maxUsageLimit: 20,
    usageCount: 20, // Exhausted
    applicability: 'specific_products',
    applicableProductIds: ['prod_2'],
    applicableSubscriptionIds: [],
    status: 'expired',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
];

class DiscountService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DISCOUNTS));
      }
    } catch {
      // storage fallback
    }
  }

  getDiscounts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : INITIAL_DISCOUNTS;
      const today = planService.getCurrentDate();

      // Dynamic status evaluation
      return list.map((disc) => {
        let status = disc.status;
        if (status !== 'inactive') {
          if (disc.validUntil && today > disc.validUntil) {
            status = 'expired';
          } else if (disc.maxUsageLimit && disc.usageCount >= disc.maxUsageLimit) {
            status = 'expired';
          } else if (disc.validFrom && today < disc.validFrom) {
            status = 'upcoming';
          } else {
            status = 'active';
          }
        }
        return {
          ...disc,
          status,
        };
      });
    } catch {
      return INITIAL_DISCOUNTS;
    }
  }

  getDiscountById(id) {
    const list = this.getDiscounts();
    return list.find((d) => d.id === id) || null;
  }

  getDiscountByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const list = this.getDiscounts();
    return list.find((d) => d.code && d.code.trim().toUpperCase() === cleanCode) || null;
  }

  validateDiscountData(data) {
    const errors = {};
    if (!data.name || !data.name.trim()) {
      errors.name = 'Discount name is required.';
    }
    const val = Number(data.value);
    if (isNaN(val) || val < 0) {
      errors.value = 'Discount value must be a non-negative number.';
    }
    if (data.type === 'percentage' && (val < 0 || val > 100)) {
      errors.value = 'Percentage discount must be between 0 and 100.';
    }
    if (data.minPurchaseAmount !== undefined && Number(data.minPurchaseAmount) < 0) {
      errors.minPurchaseAmount = 'Minimum purchase amount cannot be negative.';
    }
    if (data.maxUsageLimit !== undefined && data.maxUsageLimit !== '' && Number(data.maxUsageLimit) <= 0) {
      errors.maxUsageLimit = 'Maximum usage limit must be positive.';
    }
    if (data.validFrom && data.validUntil && data.validUntil < data.validFrom) {
      errors.validUntil = 'End date cannot be earlier than start date.';
    }
    return errors;
  }

  createDiscount(data) {
    const errors = this.validateDiscountData(data);
    if (Object.keys(errors).length > 0) {
      throw new Error(Object.values(errors)[0]);
    }

    const list = this.getDiscounts();
    const newDiscount = {
      id: `disc_${Date.now()}`,
      name: data.name.trim(),
      code: data.code ? data.code.trim().toUpperCase() : `PROMO${Math.floor(1000 + Math.random() * 9000)}`,
      description: data.description ? data.description.trim() : '',
      type: data.type || 'percentage',
      value: Number(data.value) || 0,
      minPurchaseAmount: Number(data.minPurchaseAmount) || 0,
      minQuantity: Math.max(1, Number(data.minQuantity) || 1),
      validFrom: data.validFrom || '',
      validUntil: data.validUntil || '',
      maxUsageLimit: data.maxUsageLimit ? Number(data.maxUsageLimit) : null,
      usageCount: 0,
      applicability: data.applicability || 'all',
      applicableProductIds: data.applicableProductIds || [],
      applicableSubscriptionIds: data.applicableSubscriptionIds || [],
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDiscount, ...list];
    this.saveDiscounts(updated);
    return newDiscount;
  }

  updateDiscount(id, data) {
    const list = this.getDiscounts();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const errors = this.validateDiscountData({ ...list[index], ...data });
    if (Object.keys(errors).length > 0) {
      throw new Error(Object.values(errors)[0]);
    }

    list[index] = {
      ...list[index],
      ...data,
      value: data.value !== undefined ? Number(data.value) : list[index].value,
      minPurchaseAmount: data.minPurchaseAmount !== undefined ? Number(data.minPurchaseAmount) : list[index].minPurchaseAmount,
      maxUsageLimit: data.maxUsageLimit !== undefined ? (data.maxUsageLimit ? Number(data.maxUsageLimit) : null) : list[index].maxUsageLimit,
      updatedAt: new Date().toISOString(),
    };

    this.saveDiscounts(list);
    return list[index];
  }

  deleteDiscount(id) {
    const list = this.getDiscounts();
    const filtered = list.filter((d) => d.id !== id);
    this.saveDiscounts(filtered);
    return true;
  }

  /**
   * Automatic Discount Evaluation Engine
   * Finds the best eligible discount for an invoice line, items, or subtotal
   */
  evaluateDiscount(firstArg, secondArg = {}) {
    let opts = {};
    if (typeof firstArg === 'string') {
      opts = {
        discountCode: firstArg,
        discountId: firstArg,
        ...secondArg,
      };
    } else {
      opts = { ...firstArg };
    }

    const {
      discountId = null,
      discountCode = null,
      subtotal: rawSubtotal,
      quantity: rawQuantity,
      productId = null,
      subscriptionId = null,
      currentDate = null,
      items = null,
    } = opts;

    let subtotal = Number(rawSubtotal) || 0;
    let quantity = Number(rawQuantity) || 1;

    if (items && Array.isArray(items)) {
      if (!rawSubtotal) {
        subtotal = items.reduce((acc, i) => acc + (Number(i.lineTotal) || Number(i.totalPrice) || (Number(i.quantity || 1) * Number(i.unitPrice || 0))), 0);
      }
      if (!rawQuantity) {
        quantity = items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
      }
    }

    const today = currentDate || planService.getCurrentDate();
    let discount = null;

    if (discountId) {
      discount = this.getDiscountById(discountId);
    }
    if (!discount && discountCode) {
      discount = this.getDiscountByCode(discountCode);
    }

    if (!discount) return { eligible: false, valid: false, reason: 'Discount not found', discountAmount: 0 };

    // 1. Check status
    if (discount.status === 'inactive') {
      return { eligible: false, valid: false, reason: 'Discount is inactive', discountAmount: 0 };
    }

    // 2. Check validity dates
    if (discount.validFrom && today < discount.validFrom) {
      return { eligible: false, valid: false, reason: `Discount is not yet valid (starts ${discount.validFrom})`, discountAmount: 0 };
    }
    if (discount.validUntil && today > discount.validUntil) {
      return { eligible: false, valid: false, reason: `Discount has expired (ended ${discount.validUntil})`, discountAmount: 0 };
    }

    // 3. Check usage limit
    if (discount.maxUsageLimit && discount.usageCount >= discount.maxUsageLimit) {
      return { eligible: false, valid: false, reason: 'Discount usage limit reached', discountAmount: 0 };
    }

    // 4. Check minimum purchase amount
    if (discount.minPurchaseAmount && subtotal < discount.minPurchaseAmount) {
      return {
        eligible: false,
        valid: false,
        reason: `Subtotal ₹${subtotal.toLocaleString('en-IN')} below minimum ₹${discount.minPurchaseAmount.toLocaleString('en-IN')}`,
        discountAmount: 0,
      };
    }

    // 5. Check minimum quantity
    if (discount.minQuantity && quantity < discount.minQuantity) {
      return {
        eligible: false,
        valid: false,
        reason: `Quantity ${quantity} below minimum required ${discount.minQuantity}`,
        discountAmount: 0,
      };
    }

    // 6. Check applicability
    if (discount.applicability === 'specific_products') {
      const targetIds = discount.applicableProductIds || [];
      const matchesSingle = productId && targetIds.includes(productId);
      const matchesItems = items && Array.isArray(items) && items.some((item) => targetIds.includes(item.productId));
      if (!matchesSingle && !matchesItems) {
        return { eligible: false, valid: false, reason: 'Discount does not apply to selected product(s)', discountAmount: 0 };
      }
    }
    if (discount.applicability === 'specific_subscriptions' && subscriptionId) {
      if (!discount.applicableSubscriptionIds.includes(subscriptionId)) {
        return { eligible: false, valid: false, reason: 'Discount does not apply to this subscription', discountAmount: 0 };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    // Cap at subtotal (cannot reduce invoice below zero)
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      eligible: true,
      valid: true,
      discount,
      discountAmount,
    };
  }

  recordDiscountUsage(id) {
    const list = this.getDiscounts();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return false;

    list[index].usageCount = (list[index].usageCount || 0) + 1;
    if (list[index].maxUsageLimit && list[index].usageCount >= list[index].maxUsageLimit) {
      list[index].status = 'expired';
    }
    list[index].updatedAt = new Date().toISOString();
    this.saveDiscounts(list);
    return true;
  }

  saveDiscounts(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage fallback
    }
  }
}

export const discountService = new DiscountService();
