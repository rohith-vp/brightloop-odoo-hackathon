import { notFound } from '../errors.js';

export const SUBSCRIPTION_SELECT = `
  SELECT
    s.id,
    s.customer_id,
    s.plan_id,
    s.quantity,
    s.status,
    s.start_date,
    s.end_date,
    s.created_at,
    s.updated_at,
    u.name AS customer_name,
    u.email AS customer_email,
    p.name AS plan_name,
    p.billing_interval
  FROM subscriptions s
  JOIN users u ON u.id = s.customer_id
  JOIN plans p ON p.id = s.plan_id
`;

export async function findSubscription(db, id) {
  const { rows } = await db.query(
    `${SUBSCRIPTION_SELECT} WHERE s.id = $1`,
    [id],
  );

  if (rows.length === 0) throw notFound('Subscription');
  return rows[0];
}

export async function assertCustomerExists(db, id) {
  const { rowCount } = await db.query(
    `SELECT 1 FROM users WHERE id = $1 AND role = 'CUSTOMER'`,
    [id],
  );

  if (rowCount === 0) throw notFound('Customer');
}

export async function assertPlanExists(db, id) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM plans WHERE id = $1',
    [id],
  );

  if (rowCount === 0) throw notFound('Plan');
}