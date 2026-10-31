-- Percentage discount rules, applied automatically at invoice generation.
-- times_used is incremented in the same transaction that creates the invoice, so a
-- failed run leaves the usage count unchanged. The CHECK below is a last-resort guard.

CREATE TABLE discount_rules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL CHECK (length(btrim(name)) > 0),
  discount_type     text NOT NULL DEFAULT 'PERCENT' CHECK (discount_type = 'PERCENT'),
  value             numeric(5,2) NOT NULL CHECK (value > 0 AND value <= 100),
  minimum_quantity  integer NOT NULL DEFAULT 1 CHECK (minimum_quantity >= 1),
  starts_on         date NOT NULL,
  ends_on           date,
  usage_limit       integer CHECK (usage_limit IS NULL OR usage_limit >= 1),
  times_used        integer NOT NULL DEFAULT 0 CHECK (times_used >= 0),
  enabled           boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on IS NULL OR ends_on >= starts_on),
  CHECK (usage_limit IS NULL OR times_used <= usage_limit)
);

ALTER TABLE invoices
  ADD COLUMN discount_rule_id uuid REFERENCES discount_rules (id) ON DELETE RESTRICT,
  ADD COLUMN discount_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100);
