import { z } from 'zod';
import { UUID_PATTERN } from '../validation.js';

export const BILLING_INTERVALS = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
export const END_BEHAVIORS = ['AUTO_CLOSE', 'MANUAL_CLOSE'];

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const money = z
  .string()
  .regex(MONEY_PATTERN, 'Use an amount of zero or more with at most two decimals, such as 100.00.');
export const uuid = z.string().regex(UUID_PATTERN, 'Must be a valid id.');
export const isoDate = z
  .string()
  .regex(ISO_DATE_PATTERN, 'Use the format YYYY-MM-DD.')
  .refine(isRealDate, 'Not a real calendar date.');

// Update schemas are "partial" and never add defaults. Otherwise a PATCH that
// omits a field would overwrite the stored value with the default.
function updateOf(fields) {
  return z
    .object(fields)
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0, { error: 'Send at least one field to change.' });
}

// Products -------------------------------------------------------------------

const productFields = {
  name: z.string().trim().min(1, 'Name is required.').max(200, 'Name must be 200 characters or fewer.'),
  type: z.string().trim().max(100).nullish(),
  sale_price: money,
  cost_price: money.nullish(),
  notes: z.string().max(2000).nullish(),
};

export const productCreateSchema = z.object(productFields).strict();
export const productUpdateSchema = updateOf(productFields);

// Variants -------------------------------------------------------------------
// Example: attribute "Brand", value "Odoo", price_extra "560.00".

const variantFields = {
  attribute: z.string().trim().min(1, 'Attribute is required.').max(100),
  value: z.string().trim().min(1, 'Value is required.').max(200),
  price_extra: money,
};

export const variantCreateSchema = z
  .object({ ...variantFields, price_extra: money.default('0.00') })
  .strict();
export const variantUpdateSchema = updateOf(variantFields);

// Plans ----------------------------------------------------------------------

const planFields = {
  name: z.string().trim().min(1, 'Name is required.').max(200),
  product_variant_id: uuid,
  billing_interval: z.enum(BILLING_INTERVALS, { error: 'Use DAY, WEEK, MONTH, or YEAR.' }),
  minimum_quantity: z.number().int().min(1, 'Minimum quantity must be at least 1.').max(1_000_000),
  end_behavior: z.enum(END_BEHAVIORS, { error: 'Use AUTO_CLOSE or MANUAL_CLOSE.' }),
  available_from: isoDate.nullish(),
  available_to: isoDate.nullish(),
};

const availabilityInOrder = (plan) =>
  !plan.available_from || !plan.available_to || plan.available_to >= plan.available_from;

export const planCreateSchema = z
  .object({ ...planFields, minimum_quantity: planFields.minimum_quantity.default(1) })
  .strict()
  .refine(availabilityInOrder, {
    path: ['available_to'],
    error: 'Must be on or after available_from.',
  });
export const planUpdateSchema = updateOf(planFields);

// Query filter for GET /plans.
export const planListFilter = z.object({
  product_variant_id: z.string().regex(UUID_PATTERN, 'Must be a valid id.').optional(),
});
