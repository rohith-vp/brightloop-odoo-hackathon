ALTER TABLE invoices
  ADD COLUMN billing_period date,
  ADD COLUMN subtotal numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN total numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN balance_due numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_subscription_period_key
  UNIQUE (subscription_id, billing_period);