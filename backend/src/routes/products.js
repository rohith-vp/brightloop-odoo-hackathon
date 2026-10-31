import { Router } from 'express';
import { notFound } from '../errors.js';
import { parseWith, paginationQuery, isUuid } from '../validation.js';
import { requireAuth, requireRole, WRITE_ROLES } from '../auth.js';
import { productCreateSchema, productUpdateSchema } from '../schemas/catalog.js';
import { sendData, sendList } from '../response.js';
import { PRODUCT_COLUMNS, findProduct, listVariants } from '../repositories/catalog.js';

export function productsRouter({ db }) {
  const router = Router();

  router.get('/', requireAuth, async (req, res) => {
    const { page, page_size } = parseWith(paginationQuery, req.query);
    const [rows, count] = await Promise.all([
      db.query(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY name, id LIMIT $1 OFFSET $2`, [
        page_size,
        (page - 1) * page_size,
      ]),
      db.query('SELECT count(*)::int AS total FROM products'),
    ]);
    sendList(res, rows.rows, { page, page_size, total: count.rows[0].total });
  });

  router.post('/', requireRole(...WRITE_ROLES), async (req, res) => {
    const input = parseWith(productCreateSchema, req.body);
    const { rows } = await db.query(
      `INSERT INTO products (name, type, sale_price, cost_price, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PRODUCT_COLUMNS}`,
      [input.name, input.type ?? null, input.sale_price, input.cost_price ?? null, input.notes ?? null],
    );
    sendData(res, { ...rows[0], variants: [] }, 201);
  });

  router.get('/:productId', requireAuth, async (req, res) => {
    const product = await findProduct(db, req.params.productId);
    sendData(res, { ...product, variants: await listVariants(db, product.id) });
  });

  router.patch('/:productId', requireRole(...WRITE_ROLES), async (req, res) => {
    const existing = await findProduct(db, req.params.productId);
    const patch = parseWith(productUpdateSchema, req.body);
    // Validate the full merged record, so rules that span fields are still checked.
    const merged = parseWith(productCreateSchema, {
      name: existing.name,
      type: existing.type,
      sale_price: existing.sale_price,
      cost_price: existing.cost_price,
      notes: existing.notes,
      ...patch,
    });
    const { rows } = await db.query(
      `UPDATE products
          SET name = $2, type = $3, sale_price = $4, cost_price = $5, notes = $6, updated_at = now()
        WHERE id = $1
       RETURNING ${PRODUCT_COLUMNS}`,
      [existing.id, merged.name, merged.type ?? null, merged.sale_price, merged.cost_price ?? null, merged.notes ?? null],
    );
    sendData(res, { ...rows[0], variants: await listVariants(db, existing.id) });
  });

  router.delete('/:productId', requireRole(...WRITE_ROLES), async (req, res) => {
    const { productId } = req.params;
    if (!isUuid(productId)) throw notFound('Product');
    // Variants cascade. A variant that a plan uses blocks the delete (409).
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [productId]);
    if (rowCount === 0) throw notFound('Product');
    res.status(204).end();
  });

  return router;
}
