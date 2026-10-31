import { addDays, invoiceAmounts, periodsToBill } from '../billing.js';

// Arbitrary constant. The advisory lock makes concurrent runs take turns.
export const BILLING_RUN_LOCK_KEY = 960002;

// Active subscriptions that have started by the run date, with what is needed to price them.
const ACTIVE_SUBSCRIPTIONS_SQL = `
  SELECT s.id, s.customer_id, s.quantity, s.payment_terms_days,
         to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
         to_char(s.expiry_date, 'YYYY-MM-DD') AS expiry_date,
         s.number, p.name AS product_name, pl.name AS plan_name, pl.billing_interval,
         (p.sale_price + v.price_extra)::text AS unit_price,
         COALESCE(t.rate_percent, 0)::text AS tax_rate_percent
    FROM subscriptions s
    JOIN plans pl ON pl.id = s.plan_id
    JOIN product_variants v ON v.id = pl.product_variant_id
    JOIN products p ON p.id = v.product_id
    LEFT JOIN taxes t ON t.id = s.tax_id
   WHERE s.status = 'ACTIVE' AND s.start_date <= $1::date
   ORDER BY s.number`;

const INSERT_INVOICE_SQL = `
  INSERT INTO invoices (
    subscription_id, customer_id, status, period_start, period_end, issue_date, due_date,
    description, quantity, unit_price, subtotal, discount_amount, tax_rate_percent, tax_amount, total
  )
  VALUES ($1, $2, 'DRAFT', $3, $4, $3, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  ON CONFLICT (subscription_id, period_start) DO NOTHING
  RETURNING id, number`;

// Creates the invoices due as of `asOf` for every active subscription, in one transaction.
//
// - All invoices are created in one transaction. If any step fails, none are kept.
// - The UNIQUE (subscription_id, period_start) constraint blocks duplicates, so a repeated run creates nothing new.
// - Periods already invoiced are skipped, and missed periods are caught up.
//
// `afterInvoiceCreated` is a test hook. It lets a test fail the run partway through.
export async function runBilling(pool, { asOf, afterInvoiceCreated } = {}) {
  const client = await pool.connect();
  const summary = { as_of: asOf, created_count: 0, skipped_count: 0, invoices: [] };

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [BILLING_RUN_LOCK_KEY]);

    const { rows: subscriptions } = await client.query(ACTIVE_SUBSCRIPTIONS_SQL, [asOf]);

    for (const sub of subscriptions) {
      const { rows: last } = await client.query(
        `SELECT to_char(max(period_start), 'YYYY-MM-DD') AS last FROM invoices WHERE subscription_id = $1`,
        [sub.id],
      );

      const periods = periodsToBill({
        startDate: sub.start_date,
        interval: sub.billing_interval,
        asOf,
        lastBilledPeriodStart: last[0].last,
        expiryDate: sub.expiry_date,
      });

      if (periods.length === 0) {
        summary.skipped_count += 1;
        continue;
      }

      for (const period of periods) {
        const amounts = invoiceAmounts({
          quantity: sub.quantity,
          unitPrice: sub.unit_price,
          taxRatePercent: sub.tax_rate_percent,
        });
        const lastDay = addDays(period.end, -1);
        const { rows } = await client.query(INSERT_INVOICE_SQL, [
          sub.id,
          sub.customer_id,
          period.start,
          period.end,
          addDays(period.start, sub.payment_terms_days),
          `${sub.product_name} · ${sub.plan_name}: ${sub.quantity} seat(s), ${period.start} to ${lastDay}`,
          sub.quantity,
          amounts.unit_price,
          amounts.subtotal,
          amounts.discount_amount,
          amounts.tax_rate_percent,
          amounts.tax_amount,
          amounts.total,
        ]);

        // A conflict means the period was invoiced already, so nothing was created.
        if (rows.length === 0) continue;

        summary.created_count += 1;
        summary.invoices.push({
          id: rows[0].id,
          number: rows[0].number,
          subscription_id: sub.id,
          period_start: period.start,
          period_end: period.end,
          total: amounts.total,
        });
        if (afterInvoiceCreated) await afterInvoiceCreated(summary.invoices.length);
      }
    }

    await client.query('COMMIT');
    return summary;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
