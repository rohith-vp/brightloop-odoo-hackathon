import { z } from 'zod';
import { isoDate } from './catalog.js';

const PERCENT_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

const percent = z
  .string({ error: 'Percent is required.' })
  .regex(PERCENT_PATTERN, 'Use a percent such as 10.00, with at most two decimals.')
  .refine((value) => Number(value) > 0 && Number(value) <= 100, 'Percent must be above 0 and at most 100.');

const fields = {
  name: z.string().trim().min(1, 'Name is required.').max(200),
  value: percent,
  minimum_quantity: z.number().int().min(1, 'Minimum quantity must be at least 1.').max(1_000_000),
  starts_on: isoDate,
  ends_on: isoDate.nullish(),
  usage_limit: z.number().int().min(1, 'Usage limit must be at least 1.').max(1_000_000).nullish(),
  enabled: z.boolean(),
};

const datesInOrder = (rule) => !rule.ends_on || !rule.starts_on || rule.ends_on >= rule.starts_on;

// Create: defaults apply here only. Update schemas never add defaults, so a PATCH
// that omits a field keeps the stored value.
export const discountCreateSchema = z
  .object({ ...fields, minimum_quantity: fields.minimum_quantity.default(1), enabled: fields.enabled.default(true) })
  .strict()
  .refine(datesInOrder, { path: ['ends_on'], error: 'Must be on or after the start date.' });

export const discountUpdateSchema = z
  .object(fields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, { error: 'Send at least one field to change.' });
