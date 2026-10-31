import { Router } from 'express';
import { parseWith } from '../validation.js';
import { requireRole, ROLES, WRITE_ROLES } from '../auth.js';
import { sendData } from '../response.js';
import { taxCreateSchema } from '../schemas/billing.js';

export function taxesRouter({ db }) {
  const router = Router();

  router.get('/', requireRole(...WRITE_ROLES), async (req, res) => {
    const { rows } = await db.query(
      `SELECT id, name, rate_percent, created_at, updated_at FROM taxes ORDER BY name, id`,
    );
    sendData(res, rows);
  });

  // Only admins set tax rules.
  router.post('/', requireRole(ROLES.ADMIN), async (req, res) => {
    const input = parseWith(taxCreateSchema, req.body);
    const { rows } = await db.query(
      `INSERT INTO taxes (name, rate_percent) VALUES ($1, $2)
       RETURNING id, name, rate_percent, created_at, updated_at`,
      [input.name, input.rate_percent],
    );
    sendData(res, rows[0], 201);
  });

  return router;
}
