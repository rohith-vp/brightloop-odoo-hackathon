import { Router } from 'express';
import { ApiError, notFound } from '../errors.js';
import { isUuid, parseWith, paginationQuery } from '../validation.js';
import { ROLES, requireRole } from '../auth.js';
import { sendData, sendList } from '../response.js';
import { discountCreateSchema, discountUpdateSchema } from '../schemas/discounts.js';
import { DISCOUNT_COLUMNS } from '../repositories/billing.js';

async function findDiscount(db, id) {
  if (!isUuid(id)) throw notFound('Discount rule');
  const { rows } = await db.query(`SELECT ${DISCOUNT_COLUMNS} FROM discount_rules d WHERE d.id = $1`, [id]);
  if (!rows[0]) throw notFound('Discount rule');
  return rows[0];
}

// Admin only. Only admins create or change discount rules.
export function discountsRouter({ db }) {
  const router = Router();
  const adminOnly = requireRole(ROLES.ADMIN);

  router.get('/', adminOnly, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const [rows, count] = await Promise.all([
      db.query(
        `SELECT ${DISCOUNT_COLUMNS} FROM discount_rules d ORDER BY d.created_at, d.id LIMIT $1 OFFSET $2`,
        [page_size, (page - 1) * page_size],
      ),
      db.query('SELECT count(*)::int AS total FROM discount_rules'),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  router.post('/', adminOnly, async (req, res) => {
    const input = parseWith(discountCreateSchema, req.body);
    const { rows } = await db.query(
      `INSERT INTO discount_rules (name, value, minimum_quantity, starts_on, ends_on, usage_limit, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        input.name,
        input.value,
        input.minimum_quantity,
        input.starts_on,
        input.ends_on ?? null,
        input.usage_limit ?? null,
        input.enabled,
      ],
    );
    sendData(res, await findDiscount(db, rows[0].id), 201);
  });

  router.get('/:ruleId', adminOnly, async (req, res) => {
    sendData(res, await findDiscount(db, req.params.ruleId));
  });

  router.patch('/:ruleId', adminOnly, async (req, res) => {
    const existing = await findDiscount(db, req.params.ruleId);
    const patch = parseWith(discountUpdateSchema, req.body);
    const merged = parseWith(discountCreateSchema, {
      name: existing.name,
      value: existing.value,
      minimum_quantity: existing.minimum_quantity,
      starts_on: existing.starts_on,
      ends_on: existing.ends_on,
      usage_limit: existing.usage_limit,
      enabled: existing.enabled,
      ...patch,
    });

    // A usage limit below the uses already made would break the rule's own invariant.
    if (merged.usage_limit != null && merged.usage_limit < existing.times_used) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', {
        usage_limit: `Must be at least ${existing.times_used}, the number of invoices already discounted.`,
      });
    }

    await db.query(
      `UPDATE discount_rules
          SET name = $2, value = $3, minimum_quantity = $4, starts_on = $5, ends_on = $6,
              usage_limit = $7, enabled = $8, updated_at = now()
        WHERE id = $1`,
      [
        existing.id,
        merged.name,
        merged.value,
        merged.minimum_quantity,
        merged.starts_on,
        merged.ends_on ?? null,
        merged.usage_limit ?? null,
        merged.enabled,
      ],
    );
    sendData(res, await findDiscount(db, existing.id));
  });

  return router;
}
