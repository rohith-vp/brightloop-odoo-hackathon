import { Router } from 'express';
import { notFound } from '../errors.js';
import { isUuid, parseWith } from '../validation.js';
import { requireAuth, requireRole, WRITE_ROLES } from '../auth.js';
import { variantCreateSchema, variantUpdateSchema } from '../schemas/catalog.js';
import { sendData } from '../response.js';
import { VARIANT_COLUMNS, findProduct, findVariant, listVariants } from '../repositories/catalog.js';

// Mounted at /api, because variant paths sit under two different resources.
export function variantsRouter({ db }) {
  const router = Router();

  router.get('/products/:productId/variants', requireAuth, async (req, res) => {
    const product = await findProduct(db, req.params.productId);
    sendData(res, await listVariants(db, product.id));
  });

  router.post('/products/:productId/variants', requireRole(...WRITE_ROLES), async (req, res) => {
    const product = await findProduct(db, req.params.productId);
    const input = parseWith(variantCreateSchema, req.body);
    const { rows } = await db.query(
      `INSERT INTO product_variants (product_id, attribute, value, price_extra)
       VALUES ($1, $2, $3, $4)
       RETURNING ${VARIANT_COLUMNS}`,
      [product.id, input.attribute, input.value, input.price_extra],
    );
    sendData(res, rows[0], 201);
  });

  router.patch('/variants/:variantId', requireRole(...WRITE_ROLES), async (req, res) => {
    const existing = await findVariant(db, req.params.variantId);
    const patch = parseWith(variantUpdateSchema, req.body);
    const merged = parseWith(variantCreateSchema, {
      attribute: existing.attribute,
      value: existing.value,
      price_extra: existing.price_extra,
      ...patch,
    });
    const { rows } = await db.query(
      `UPDATE product_variants
          SET attribute = $2, value = $3, price_extra = $4, updated_at = now()
        WHERE id = $1
       RETURNING ${VARIANT_COLUMNS}`,
      [existing.id, merged.attribute, merged.value, merged.price_extra],
    );
    sendData(res, rows[0]);
  });

  router.delete('/variants/:variantId', requireRole(...WRITE_ROLES), async (req, res) => {
    const { variantId } = req.params;
    if (!isUuid(variantId)) throw notFound('Variant');
    // A variant that a plan uses blocks the delete (409).
    const { rowCount } = await db.query('DELETE FROM product_variants WHERE id = $1', [variantId]);
    if (rowCount === 0) throw notFound('Variant');
    res.status(204).end();
  });

  return router;
}
