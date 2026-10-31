import { z } from 'zod';

const uuid = z.string().uuid();

export const subscriptionCreateSchema = z.object({
  customer_id: uuid,
  plan_id: uuid,
  quantity: z.coerce.number().int().min(1).default(1),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional().nullable(),
}).strict();

export const subscriptionUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional().nullable(),
}).strict();

export const subscriptionListFilter = z.object({
  customer_id: uuid.optional(),
  plan_id: uuid.optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
}).strict();