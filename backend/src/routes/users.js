import { Router } from 'express';
import { notFound } from '../errors.js';
import { isUuid, parseWith, paginationQuery } from '../validation.js';
import { ROLES, requireRole } from '../auth.js';
import { sendData, sendList } from '../response.js';
import { adminCreateUserSchema, roleUpdateSchema } from '../schemas/auth.js';
import { PUBLIC_USER_COLUMNS, insertUser } from './auth.js';
import { ApiError } from '../errors.js';

// Admin-only account management. Staff are created or promoted here.
export function usersRouter({ db }) {
  const router = Router();
  const adminOnly = requireRole(ROLES.ADMIN);

  router.get('/', adminOnly, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const [rows, count] = await Promise.all([
      db.query(
        `SELECT ${PUBLIC_USER_COLUMNS} FROM users ORDER BY created_at, id LIMIT $1 OFFSET $2`,
        [page_size, (page - 1) * page_size],
      ),
      db.query('SELECT count(*)::int AS total FROM users'),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  router.post('/', adminOnly, async (req, res) => {
    const input = parseWith(adminCreateUserSchema, req.body);
    sendData(res, await insertUser(db, input), 201);
  });

  router.patch('/:userId/role', adminOnly, async (req, res) => {
    const { userId } = req.params;
    if (!isUuid(userId)) throw notFound('User');
    const { role } = parseWith(roleUpdateSchema, req.body);

    // Stops the last admin from removing their own access by accident.
    if (userId === req.user.id && role !== ROLES.ADMIN) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', {
        role: 'You cannot remove your own admin role.',
      });
    }

    const { rows } = await db.query(
      `UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING ${PUBLIC_USER_COLUMNS}`,
      [userId, role],
    );
    if (!rows[0]) throw notFound('User');
    sendData(res, rows[0]);
  });

  return router;
}
