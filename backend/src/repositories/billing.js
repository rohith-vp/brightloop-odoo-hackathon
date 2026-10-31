import { notFound } from '../errors.js';
import { isUuid } from '../validation.js';
import { PLAN_SELECT } from './catalog.js';

// Dates are read with to_char so PostgreSQL date values never pass through a JS Date,
// which could shift them by a day in some timezones.
export const SUBSCRIPTION_COLUMNS = `
  s.id, s.number, s.customer_id, s.plan_id, s.tax_id, s.quantity, s.status,
  to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
  to_char(s.expiry_date, 'YYYY-MM-DD') AS expiry_date,
  s.payment_terms_days, s.created_at, s.updated_at`;

export const INVOICE_COLUMNS = `
  i.id, i.number, i.subscription_id, i.customer_id, i.status,
  to_char(i.period_start, 'YYYY-MM-DD') AS period_start,
  to_char(i.period_end, 'YYYY-MM-DD') AS period_end,
  to_char(i.issue_date, 'YYYY-MM-DD') AS issue_date,
  to_char(i.due_date, 'YYYY-MM-DD') AS due_date,
  i.description, i.quantity, i.unit_price, i.subtotal, i.discount_amount,
  i.tax_rate_percent, i.tax_amount, i.total, i.created_at, i.updated_at`;

export async function findSubscription(db, id) {
  if (!isUuid(id)) throw notFound('Subscription');
  const { rows } = await db.query(`SELECT ${SUBSCRIPTION_COLUMNS} FROM subscriptions s WHERE s.id = $1`, [id]);
  if (!rows[0]) throw notFound('Subscription');
  return rows[0];
}

export async function findInvoice(db, id) {
  if (!isUuid(id)) throw notFound('Invoice');
  const { rows } = await db.query(`SELECT ${INVOICE_COLUMNS} FROM invoices i WHERE i.id = $1`, [id]);
  if (!rows[0]) throw notFound('Invoice');
  return rows[0];
}

// Returns the plan row, or null. Used to validate a subscription before it is created.
export async function findPlanOrNull(db, id) {
  const { rows } = await db.query(`${PLAN_SELECT} WHERE pl.id = $1`, [id]);
  return rows[0] ?? null;
}
