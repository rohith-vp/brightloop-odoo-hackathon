// Form validation for sign-up, login, products, variants, and plans.
// Rules mirror the backend (backend/src/schemas). Keeping them as plain functions
// lets them be tested with `node --test`, without a browser.

export const PASSWORD_RULES = [
  { id: 'length', label: 'More than 8 characters', test: (p) => p.length > 8 },
  { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'At least one lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'special', label: 'At least one special character (e.g. ! @ # $ %)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const BILLING_INTERVALS = [
  { value: 'DAY', label: 'Daily' },
  { value: 'WEEK', label: 'Weekly' },
  { value: 'MONTH', label: 'Monthly' },
  { value: 'YEAR', label: 'Yearly' },
];

export const END_BEHAVIORS = [
  { value: 'AUTO_CLOSE', label: 'Close automatically at the end of availability' },
  { value: 'MANUAL_CLOSE', label: 'Close manually' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isMoney(value) {
  return MONEY_PATTERN.test(value);
}

export function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export function validateSignup({ fullName, email, password, confirmPassword }) {
  const errors = {};
  if (!text(fullName)) errors.fullName = 'Full name is required';

  if (!text(email)) errors.email = 'Work email is required';
  else if (!EMAIL_PATTERN.test(text(email))) errors.email = 'Please enter a valid work email address';

  if (!password) errors.password = 'Password is required';
  else if (!PASSWORD_RULES.every((rule) => rule.test(password))) errors.password = 'Password does not meet every rule';

  if (!confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!text(email)) errors.email = 'Email address is required';
  else if (!EMAIL_PATTERN.test(text(email))) errors.email = 'Please enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateProduct({ name, type, sale_price, cost_price, notes }) {
  const errors = {};
  if (!text(name)) errors.name = 'Name is required';
  else if (text(name).length > 200) errors.name = 'Name must be 200 characters or fewer';

  if (text(type).length > 100) errors.type = 'Type must be 100 characters or fewer';

  if (!text(sale_price)) errors.sale_price = 'Sale price is required';
  else if (!isMoney(text(sale_price))) errors.sale_price = 'Use an amount such as 100.00';

  if (text(cost_price) && !isMoney(text(cost_price))) errors.cost_price = 'Use an amount such as 40.00';

  if (typeof notes === 'string' && notes.length > 2000) errors.notes = 'Notes must be 2000 characters or fewer';
  return errors;
}

export function validateVariant({ attribute, value, price_extra }) {
  const errors = {};
  if (!text(attribute)) errors.attribute = 'Attribute is required (for example, Brand)';
  if (!text(value)) errors.value = 'Value is required (for example, Odoo)';

  if (text(price_extra) && !isMoney(text(price_extra))) {
    errors.price_extra = 'Use an amount such as 560.00, or leave blank for no extra';
  }
  return errors;
}

export function validatePlan(plan) {
  const errors = {};
  if (!text(plan.name)) errors.name = 'Name is required';

  if (!plan.product_variant_id) errors.product_variant_id = 'Choose a product variant';

  if (!BILLING_INTERVALS.some((i) => i.value === plan.billing_interval)) {
    errors.billing_interval = 'Choose a billing interval';
  }

  const quantity = Number(plan.minimum_quantity);
  if (plan.minimum_quantity === '' || plan.minimum_quantity === undefined) {
    errors.minimum_quantity = 'Minimum quantity is required';
  } else if (!Number.isInteger(quantity) || quantity < 1) {
    errors.minimum_quantity = 'Minimum quantity must be a whole number of at least 1';
  }

  if (!END_BEHAVIORS.some((e) => e.value === plan.end_behavior)) {
    errors.end_behavior = 'Choose an end behavior';
  }

  const from = text(plan.available_from);
  const to = text(plan.available_to);
  if (from && !isRealDate(from)) errors.available_from = 'Enter a real date';
  if (to && !isRealDate(to)) errors.available_to = 'Enter a real date';
  if (!errors.available_from && !errors.available_to && from && to && to < from) {
    errors.available_to = 'Must be on or after the start date';
  }
  return errors;
}
