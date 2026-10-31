import { ApiError, notFound } from '../errors.js';
import { isUuid } from '../validation.js';

export const PRODUCT_COLUMNS = 'id, name, type, sale_price, cost_price, notes, created_at, updated_at';
export const VARIANT_COLUMNS = 'id, product_id, attribute, value, price_extra, created_at, updated_at';

// unit_price is computed here, so it always matches the current product and variant prices.
export const PLAN_SELECT = `
  SELECT pl.id, pl.name, pl.product_variant_id, v.product_id,
         pl.billing_interval, pl.minimum_quantity, pl.end_behavior,
         to_char(pl.available_from, 'YYYY-MM-DD') AS available_from,
         to_char(pl.available_to, 'YYYY-MM-DD') AS available_to,
         (p.sale_price + v.price_extra) AS unit_price,
         pl.created_at, pl.updated_at
    FROM plans pl
    JOIN product_variants v ON v.id = pl.product_variant_id
    JOIN products p ON p.id = v.product_id`;

export async function findProduct(db, id) {
  if (!isUuid(id)) throw notFound('Product');
  const { rows } = await db.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`, [id]);
  if (!rows[0]) throw notFound('Product');
  return rows[0];
}

export async function listVariants(db, productId) {
  const { rows } = await db.query(
    `SELECT ${VARIANT_COLUMNS} FROM product_variants WHERE product_id = $1 ORDER BY attribute, value, id`,
    [productId],
  );
  return rows;
}

export async function findVariant(db, id) {
  if (!isUuid(id)) throw notFound('Variant');
  const { rows } = await db.query(`SELECT ${VARIANT_COLUMNS} FROM product_variants WHERE id = $1`, [id]);
  if (!rows[0]) throw notFound('Variant');
  return rows[0];
}

export async function findPlan(db, id) {
  if (!isUuid(id)) throw notFound('Plan');
  const { rows } = await db.query(`${PLAN_SELECT} WHERE pl.id = $1`, [id]);
  if (!rows[0]) throw notFound('Plan');
  return rows[0];
}

// Used before writing a plan, so a bad variant id gives a clear field error, not a raw FK error.
export async function assertVariantExists(db, id) {
  const { rows } = await db.query('SELECT 1 FROM product_variants WHERE id = $1', [id]);
  if (!rows[0]) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', {
      product_variant_id: 'Product variant does not exist.',
    });
  }
}
