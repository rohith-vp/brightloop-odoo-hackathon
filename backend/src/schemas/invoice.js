import { z } from 'zod';

const uuid = z.string().uuid();

export const invoiceListFilter = z.object({
  subscription_id: uuid.optional(),
  customer_id: uuid.optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'VOID']).optional(),
}).strict();