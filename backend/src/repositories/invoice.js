export const INVOICE_SELECT = `
  SELECT
    i.id,
    i.subscription_id,
    i.invoice_number,
    i.billing_period,
    i.subtotal,
    i.discount_amount,
    i.tax_amount,
    i.total,
    i.amount_paid,
    i.balance_due,
    i.status,
    i.due_date,
    i.issued_at,
    i.created_at,
    i.updated_at,
    s.customer_id,
    s.plan_id
  FROM invoices i
  JOIN subscriptions s ON s.id = i.subscription_id
`;

export async function findInvoice(db, id) {
  const { rows } = await db.query(
    `${INVOICE_SELECT} WHERE i.id = $1`,
    [id],
  );

  return rows[0] ?? null;
}