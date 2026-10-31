import { Router } from 'express';
import { parseWith, paginationQuery } from '../validation.js';
import { requireAuth, requireRole, WRITE_ROLES } from '../auth.js';
import {
  subscriptionCreateSchema,
  subscriptionListFilter,
} from '../schemas/subscription.js';
import { sendData, sendList } from '../response.js';
import {
  SUBSCRIPTION_SELECT,
  findSubscription,
  assertCustomerExists,
  assertPlanExists,
} from '../repositories/subscription.js';

export function subscriptionsRouter({ db }) {
  const router = Router();

  // List subscriptions
  router.get('/', requireAuth, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const filter = parseWith(subscriptionListFilter, req.query);

    const params = [];
    const conditions = [];

    if (filter.customer_id) {
      params.push(filter.customer_id);
      conditions.push(`s.customer_id = $${params.length}`);
    }

    if (filter.plan_id) {
      params.push(filter.plan_id);
      conditions.push(`s.plan_id = $${params.length}`);
    }

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`s.status = $${params.length}`);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countParams = [...params];

    params.push(page_size, (page - 1) * page_size);

    const [rows, count] = await Promise.all([
      db.query(
        `${SUBSCRIPTION_SELECT}
         ${where}
         ORDER BY s.created_at DESC
         LIMIT $${params.length - 1}
         OFFSET $${params.length}`,
        params,
      ),
      db.query(
        `SELECT count(*)::int AS total FROM subscriptions s ${where}`,
        countParams,
      ),
    ]);

    sendList(res, rows.rows, {
      page,
      page_size,
      total: count.rows[0].total,
    });
  });

  // Create a subscription
  router.post('/', requireRole(...WRITE_ROLES), async (req, res) => {
    const input = parseWith(subscriptionCreateSchema, req.body);

    await assertCustomerExists(db, input.customer_id);
    await assertPlanExists(db, input.plan_id);

    const { rows } = await db.query(
      `INSERT INTO subscriptions
        (customer_id, plan_id, quantity, start_date, end_date)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
       RETURNING id`,
      [
        input.customer_id,
        input.plan_id,
        input.quantity,
        input.start_date ?? null,
        input.end_date ?? null,
      ],
    );

    sendData(res, await findSubscription(db, rows[0].id), 201);
  });

  // Get one subscription
  router.get('/:subscriptionId', requireAuth, async (req, res) => {
    const subscription = await findSubscription(db, req.params.subscriptionId);
    sendData(res, subscription);
  });

  return router;
}