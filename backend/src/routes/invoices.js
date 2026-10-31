import { Router } from 'express';
import { z } from 'zod';
import { parseWith, paginationQuery, isUuid } from '../validation.js';
import { requireRole, WRITE_ROLES } from '../auth.js';
import { sendData, sendList } from '../response.js';
import { INVOICE_ACTIONS, invoiceMachine } from '../billing.js';
import { INVOICE_COLUMNS, findInvoice } from '../repositories/billing.js';
import { applyTransition } from '../services/transitions.js';

const listFilter = z.object({
  status: z.enum(invoiceMachine.states).optional(),
  subscription_id: z.string().optional(),
});

export function invoicesRouter({ db }) {
  const router = Router();
  const staff = requireRole(...WRITE_ROLES);

  router.get('/', staff, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const { status, subscription_id } = parseWith(listFilter, req.query);
    if (subscription_id !== undefined && !isUuid(subscription_id)) {
      return sendList(res, [], { page, page_size, total: 0 });
    }

    const clauses = [];
    const params = [];
    if (status) {
      params.push(status);
      clauses.push(`i.status = $${params.length}`);
    }
    if (subscription_id) {
      params.push(subscription_id);
      clauses.push(`i.subscription_id = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const countParams = [...params];
    params.push(page_size, (page - 1) * page_size);
    const [rows, count] = await Promise.all([
      db.query(
        `SELECT ${INVOICE_COLUMNS} FROM invoices i ${where}
         ORDER BY i.period_start DESC, i.number LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      db.query(`SELECT count(*)::int AS total FROM invoices i ${where}`, countParams),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  router.get('/:invoiceId', staff, async (req, res) => {
    sendData(res, await findInvoice(db, req.params.invoiceId));
  });

  for (const action of INVOICE_ACTIONS) {
    router.post(`/:invoiceId/${action}`, staff, async (req, res) => {
      const { from, to } = await applyTransition(db, {
        table: 'invoices',
        machine: invoiceMachine,
        id: req.params.invoiceId,
        action,
        label: 'Invoice',
      });
      sendData(res, { ...(await findInvoice(db, req.params.invoiceId)), previous_status: from, status: to });
    });
  }

  return router;
}
