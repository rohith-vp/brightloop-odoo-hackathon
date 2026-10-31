-- Accounts for sign-up, login, and role-based access.
-- Emails are stored lowercase, so the UNIQUE constraint is case-insensitive in practice.
-- Roles: ADMIN (full control), STAFF (day-to-day operations), CUSTOMER (own records only).

CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL CHECK (length(btrim(name)) > 0),
  email          text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash  text NOT NULL,
  role           text NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
