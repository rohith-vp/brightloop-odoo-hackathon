import { Router } from 'express';
import { parseWith, paginationQuery } from '../validation.js';
import { requireAuth } from '../auth.js';
import { sendData, sendList } from '../response.js';
import { invoiceListFilter } from '../schemas/invoice.js';
import { INVOICE_SELECT, findInvoice } from '../repositories/invoice.js';
import { notFound } from '../errors.js';

export function invoicesRouter({ db }) {
  const router = Router();

  // List invoices
  router.get('/', requireAuth, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const filter = parseWith(invoiceListFilter, req.query);

    const params = [];
    const conditions = [];

    if (filter.subscription_id) {
      params.push(filter.subscription_id);
      conditions.push(`i.subscription_id = $${params.length}`);
    }

    if (filter.customer_id) {
      params.push(filter.customer_id);
      conditions.push(`s.customer_id = $${params.length}`);
    }

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`i.status = $${params.length}`);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countParams = [...params];

    params.push(page_size, (page - 1) * page_size);

    const [rows, count] = await Promise.all([
      db.query(
        `${INVOICE_SELECT}
         ${where}
         ORDER BY i.created_at DESC
         LIMIT $${params.length - 1}
         OFFSET $${params.length}`,
        params,
      ),
      db.query(
        `SELECT count(*)::int AS total
         FROM invoices i
         JOIN subscriptions s ON s.id = i.subscription_id
         ${where}`,
        countParams,
      ),
    ]);

    sendList(res, rows.rows, {
      page,
      page_size,
      total: count.rows[0].total,
    });
  });

  // Get one invoice
  router.get('/:invoiceId', requireAuth, async (req, res) => {
    const invoice = await findInvoice(db, req.params.invoiceId);

    if (!invoice) {
      throw notFound('Invoice');
    }

    sendData(res, invoice);
  });

  return router;
}