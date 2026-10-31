import { Router } from 'express';
import { notFound } from '../errors.js';
import { isUuid, parseWith, paginationQuery } from '../validation.js';
import { requireAuth, requireRole, WRITE_ROLES } from '../auth.js';
import { planCreateSchema, planUpdateSchema, planListFilter } from '../schemas/catalog.js';
import { sendData, sendList } from '../response.js';
import { PLAN_SELECT, assertVariantExists, findPlan } from '../repositories/catalog.js';

export function plansRouter({ db }) {
  const router = Router();

  router.get('/', requireAuth, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const filter = parseWith(planListFilter, req.query);

    const params = [];
    let where = '';
    if (filter.product_variant_id) {
      params.push(filter.product_variant_id);
      where = `WHERE pl.product_variant_id = $${params.length}`;
    }

    const countParams = [...params];
    params.push(page_size, (page - 1) * page_size);
    const [rows, count] = await Promise.all([
      db.query(
        `${PLAN_SELECT} ${where} ORDER BY pl.name, pl.id LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      db.query(`SELECT count(*)::int AS total FROM plans pl ${where}`, countParams),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  router.post('/', requireRole(...WRITE_ROLES), async (req, res) => {
    const input = parseWith(planCreateSchema, req.body);
    await assertVariantExists(db, input.product_variant_id);
    const { rows } = await db.query(
      `INSERT INTO plans (name, product_variant_id, billing_interval, minimum_quantity, end_behavior,
                          available_from, available_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        input.name,
        input.product_variant_id,
        input.billing_interval,
        input.minimum_quantity,
        input.end_behavior,
        input.available_from ?? null,
        input.available_to ?? null,
      ],
    );
    sendData(res, await findPlan(db, rows[0].id), 201);
  });

  router.get('/:planId', requireAuth, async (req, res) => {
    sendData(res, await findPlan(db, req.params.planId));
  });

  router.patch('/:planId', requireRole(...WRITE_ROLES), async (req, res) => {
    const existing = await findPlan(db, req.params.planId);
    const patch = parseWith(planUpdateSchema, req.body);
    const merged = parseWith(planCreateSchema, {
      name: existing.name,
      product_variant_id: existing.product_variant_id,
      billing_interval: existing.billing_interval,
      minimum_quantity: existing.minimum_quantity,
      end_behavior: existing.end_behavior,
      available_from: existing.available_from,
      available_to: existing.available_to,
      ...patch,
    });
    if (merged.product_variant_id !== existing.product_variant_id) {
      await assertVariantExists(db, merged.product_variant_id);
    }
    await db.query(
      `UPDATE plans
          SET name = $2, product_variant_id = $3, billing_interval = $4, minimum_quantity = $5,
              end_behavior = $6, available_from = $7, available_to = $8, updated_at = now()
        WHERE id = $1`,
      [
        existing.id,
        merged.name,
        merged.product_variant_id,
        merged.billing_interval,
        merged.minimum_quantity,
        merged.end_behavior,
        merged.available_from ?? null,
        merged.available_to ?? null,
      ],
    );
    sendData(res, await findPlan(db, existing.id));
  });

  router.delete('/:planId', requireRole(...WRITE_ROLES), async (req, res) => {
    const { planId } = req.params;
    if (!isUuid(planId)) throw notFound('Plan');
    const { rowCount } = await db.query('DELETE FROM plans WHERE id = $1', [planId]);
    if (rowCount === 0) throw notFound('Plan');
    res.status(204).end();
  });

  return router;
}
