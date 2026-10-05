-- Migration 001: Core multi-tenant tables (Phase 11 — Supabase)
-- customers, products, auth, companies
-- Quotation tables are intentionally NOT included in this migration.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- COMPANIES (tenant + company profile/settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL DEFAULT '',
  address               TEXT,
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  website               VARCHAR(255),
  gstin                 VARCHAR(50),
  logo                  TEXT,
  bank_account_name     VARCHAR(255),
  bank_account_number   VARCHAR(100),
  bank_name             VARCHAR(255),
  bank_branch           VARCHAR(255),
  bank_ifsc             VARCHAR(50),
  signatory_name        VARCHAR(255),
  signatory_designation VARCHAR(255) DEFAULT 'Authorised Signatory',
  signatory_signature   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT companies_name_not_blank CHECK (length(trim(name)) > 0)
);

-- ============================================================
-- USERS (credentials — company membership via company_users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

-- ============================================================
-- COMPANY_USERS (user ↔ company membership)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT company_users_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users (company_id);

-- ============================================================
-- CUSTOMERS (API: /api/customers — was "clients" in earlier schema)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers'
  ) THEN
    ALTER TABLE clients RENAME TO customers;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name   VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email          VARCHAR(255),
  phone          VARCHAR(50),
  address        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_company_name_not_blank CHECK (length(trim(company_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers (company_id);

-- Repoint legacy FK if customers still references old table name
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'customers'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name NOT IN ('companies')
  LOOP
    EXECUTE format('ALTER TABLE customers DROP CONSTRAINT IF EXISTS %I', rec.constraint_name);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'customers' AND constraint_name = 'customers_company_id_fkey'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  unit          VARCHAR(50) NOT NULL DEFAULT '',
  default_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  default_tax   NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT products_unit_not_blank CHECK (length(trim(unit)) > 0),
  CONSTRAINT products_default_price_non_negative CHECK (default_price >= 0),
  CONSTRAINT products_default_tax_non_negative CHECK (default_tax >= 0)
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products (company_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_name = 'products_company_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;
