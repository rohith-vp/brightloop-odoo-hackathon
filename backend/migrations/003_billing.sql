-- Taxes, subscriptions, and invoices.
-- Period convention: [period_start, period_end), half-open, matching packages/billing.
-- Each subscription can have at most one invoice per period start. The UNIQUE
-- constraint is the final guard against double billing, even with concurrent runs.

CREATE SEQUENCE subscription_number_seq;
CREATE SEQUENCE invoice_number_seq;

CREATE TABLE taxes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(btrim(name)) > 0),
  rate_percent  numeric(5,2) NOT NULL CHECK (rate_percent >= 0 AND rate_percent <= 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number              text NOT NULL UNIQUE DEFAULT ('SUB-' || lpad(nextval('subscription_number_seq')::text, 6, '0')),
  customer_id         uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  plan_id             uuid NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
  tax_id              uuid REFERENCES taxes (id) ON DELETE RESTRICT,
  quantity            integer NOT NULL CHECK (quantity >= 1),
  status              text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'ACTIVE', 'CLOSED')),
  start_date          date NOT NULL,
  expiry_date         date,
  payment_terms_days  integer NOT NULL DEFAULT 15 CHECK (payment_terms_days >= 0),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (expiry_date IS NULL OR expiry_date >= start_date)
);

CREATE INDEX subscriptions_status_idx ON subscriptions (status);
CREATE INDEX subscriptions_customer_id_idx ON subscriptions (customer_id);
CREATE INDEX subscriptions_plan_id_idx ON subscriptions (plan_id);

CREATE TABLE invoices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number            text NOT NULL UNIQUE DEFAULT ('INV-' || lpad(nextval('invoice_number_seq')::text, 6, '0')),
  subscription_id   uuid NOT NULL REFERENCES subscriptions (id) ON DELETE RESTRICT,
  customer_id       uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  status            text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED')),
  period_start      date NOT NULL,
  period_end        date NOT NULL,
  issue_date        date NOT NULL,
  due_date          date NOT NULL,
  description       text NOT NULL,
  quantity          integer NOT NULL CHECK (quantity >= 1),
  unit_price        numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  subtotal          numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount   numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  tax_rate_percent  numeric(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate_percent >= 0 AND tax_rate_percent <= 100),
  tax_amount        numeric(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total             numeric(12,2) NOT NULL CHECK (total >= 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end > period_start),
  CONSTRAINT invoices_one_per_period UNIQUE (subscription_id, period_start)
);

CREATE INDEX invoices_status_idx ON invoices (status);
CREATE INDEX invoices_customer_id_idx ON invoices (customer_id);
CREATE INDEX invoices_due_date_idx ON invoices (due_date);
