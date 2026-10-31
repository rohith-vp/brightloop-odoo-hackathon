-- Products, their variants (price extras such as "Brand = Odoo, +560"), and plans.
-- Money is NUMERIC(12,2), never floating point. Plan unit price is derived
-- from the product and variant at read time: sale_price + price_extra.

CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL CHECK (length(btrim(name)) > 0),
  type        text,
  sale_price  numeric(12,2) NOT NULL CHECK (sale_price >= 0),
  cost_price  numeric(12,2) CHECK (cost_price >= 0),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  attribute    text NOT NULL CHECK (length(btrim(attribute)) > 0),
  value        text NOT NULL CHECK (length(btrim(value)) > 0),
  price_extra  numeric(12,2) NOT NULL DEFAULT 0 CHECK (price_extra >= 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, attribute, value)
);

-- A plan references a variant. RESTRICT stops a variant (or product) from being
-- deleted while plans still depend on it.
CREATE TABLE plans (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL CHECK (length(btrim(name)) > 0),
  product_variant_id  uuid NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
  billing_interval    text NOT NULL CHECK (billing_interval IN ('DAY', 'WEEK', 'MONTH', 'YEAR')),
  minimum_quantity    integer NOT NULL DEFAULT 1 CHECK (minimum_quantity >= 1),
  end_behavior        text NOT NULL CHECK (end_behavior IN ('AUTO_CLOSE', 'MANUAL_CLOSE')),
  available_from      date,
  available_to        date,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (available_from IS NULL OR available_to IS NULL OR available_to >= available_from)
);

CREATE INDEX plans_product_variant_id_idx ON plans (product_variant_id);
