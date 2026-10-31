CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,

  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),

  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),

  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX subscriptions_customer_id_idx
  ON subscriptions (customer_id);

CREATE INDEX subscriptions_plan_id_idx
  ON subscriptions (plan_id);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id uuid NOT NULL
    REFERENCES subscriptions(id) ON DELETE RESTRICT,

  invoice_number text NOT NULL UNIQUE,

  amount numeric(12,2) NOT NULL CHECK (amount >= 0),

  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'VOID')),

  due_date date,
  issued_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoices_subscription_id_idx
  ON invoices (subscription_id);