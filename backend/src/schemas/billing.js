import { z } from 'zod';
import { uuid, isoDate } from './catalog.js';

const RATE_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

export const subscriptionCreateSchema = z
  .object({
    customer_id: uuid,
    plan_id: uuid,
    tax_id: uuid.nullish(),
    quantity: z.number().int('Quantity must be a whole number.').min(1, 'Quantity must be at least 1.').max(1_000_000),
    start_date: isoDate,
    expiry_date: isoDate.nullish(),
    payment_terms_days: z.number().int().min(0).max(365).default(15),
  })
  .strict()
  .refine((value) => !value.expiry_date || value.expiry_date >= value.start_date, {
    path: ['expiry_date'],
    error: 'Must be on or after the start date.',
  });

export const taxCreateSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(100),
    rate_percent: z
      .string()
      .regex(RATE_PATTERN, 'Use a rate from 0 to 100 with at most two decimals, such as 10.00.')
      .refine((value) => Number(value) <= 100, 'Rate cannot exceed 100.'),
  })
  .strict();

export const billingRunSchema = z.object({ as_of: isoDate }).strict();
