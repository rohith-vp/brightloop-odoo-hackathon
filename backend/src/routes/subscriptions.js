import { Router } from 'express';
import { ApiError } from '../errors.js';
import { parseWith, paginationQuery } from '../validation.js';
import { requireRole, WRITE_ROLES } from '../auth.js';
import { sendData, sendList } from '../response.js';
import { subscriptionCreateSchema } from '../schemas/billing.js';
import { SUBSCRIPTION_ACTIONS, subscriptionMachine } from '../billing.js';
import { SUBSCRIPTION_COLUMNS, findSubscription, findPlanOrNull } from '../repositories/billing.js';
import { applyTransition } from '../services/transitions.js';
import { z } from 'zod';

const listFilter = z.object({
  status: z.enum(subscriptionMachine.states).optional(),
});

export function subscriptionsRouter({ db }) {
  const router = Router();
  const staff = requireRole(...WRITE_ROLES);

  router.get('/', staff, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const { status } = parseWith(listFilter, req.query);
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = `WHERE s.status = $${params.length}`;
    }
    const countParams = [...params];
    params.push(page_size, (page - 1) * page_size);
    const [rows, count] = await Promise.all([
      db.query(
        `SELECT ${SUBSCRIPTION_COLUMNS} FROM subscriptions s ${where}
         ORDER BY s.number LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      db.query(`SELECT count(*)::int AS total FROM subscriptions s ${where}`, countParams),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  // New subscriptions start in DRAFT. They are not billed until they are activated.
  router.post('/', staff, async (req, res) => {
    const input = parseWith(subscriptionCreateSchema, req.body);
    const errors = {};

    const { rows: customers } = await db.query('SELECT role FROM users WHERE id = $1', [input.customer_id]);
    if (!customers[0]) errors.customer_id = 'Customer does not exist.';
    else if (customers[0].role !== 'CUSTOMER') errors.customer_id = 'Subscriptions can only belong to customer accounts.';

    const plan = await findPlanOrNull(db, input.plan_id);
    if (!plan) {
      errors.plan_id = 'Plan does not exist.';
    } else {
      if (input.quantity < plan.minimum_quantity) {
        errors.quantity = `The minimum quantity for this plan is ${plan.minimum_quantity}.`;
      }
      if (plan.available_from && input.start_date < plan.available_from) {
        errors.start_date = `This plan is not available before ${plan.available_from}.`;
      }
      if (plan.available_to && input.start_date > plan.available_to) {
        errors.start_date = `This plan is not available after ${plan.available_to}.`;
      }
    }

    if (input.tax_id) {
      const { rows: taxes } = await db.query('SELECT 1 FROM taxes WHERE id = $1', [input.tax_id]);
      if (!taxes[0]) errors.tax_id = 'Tax does not exist.';
    }

    if (Object.keys(errors).length > 0) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', errors);
    }

    const { rows } = await db.query(
      `INSERT INTO subscriptions (customer_id, plan_id, tax_id, quantity, start_date, expiry_date, payment_terms_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        input.customer_id,
        input.plan_id,
        input.tax_id ?? null,
        input.quantity,
        input.start_date,
        input.expiry_date ?? null,
        input.payment_terms_days,
      ],
    );
    sendData(res, await findSubscription(db, rows[0].id), 201);
  });

  router.get('/:subscriptionId', staff, async (req, res) => {
    sendData(res, await findSubscription(db, req.params.subscriptionId));
  });

  // One route per action. The state machine decides which actions are allowed.
  for (const action of SUBSCRIPTION_ACTIONS) {
    router.post(`/:subscriptionId/${action}`, staff, async (req, res) => {
      const { from, to } = await applyTransition(db, {
        table: 'subscriptions',
        machine: subscriptionMachine,
        id: req.params.subscriptionId,
        action,
        label: 'Subscription',
      });
      sendData(res, { ...(await findSubscription(db, req.params.subscriptionId)), previous_status: from, status: to });
    });
  }

  return router;
}
