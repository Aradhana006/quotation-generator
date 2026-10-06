-- Phase 10: Authentication + multi-tenant foundation
-- Applied automatically by db/setup.js after schema.sql

-- ============================================================
-- 1. COMPANIES (tenant root + profile fields)
-- Replaces company_profiles conceptually; profile lives on the company row.
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL DEFAULT '',
  logo                  TEXT,
  address               TEXT,
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  website               VARCHAR(255),
  gstin                 VARCHAR(50),
  bank_account_name     VARCHAR(255),
  bank_account_number   VARCHAR(100),
  bank_name             VARCHAR(255),
  bank_branch           VARCHAR(255),
  bank_ifsc             VARCHAR(50),
  signatory_name        VARCHAR(255),
  signatory_designation VARCHAR(255) DEFAULT 'Authorised Signatory',
  signatory_signature   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy legacy company_profiles rows into companies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'company_profiles'
  ) THEN
    INSERT INTO companies (
      id, name, logo, address, phone, email, website, gstin,
      bank_account_name, bank_account_number, bank_name, bank_branch, bank_ifsc,
      signatory_name, signatory_designation, signatory_signature,
      created_at, updated_at
    )
    SELECT
      id, name, logo, address, phone, email, website, gstin,
      bank_account_name, bank_account_number, bank_name, bank_branch, bank_ifsc,
      signatory_name, signatory_designation, signatory_signature,
      created_at, updated_at
    FROM company_profiles
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 2. USERS (no direct company_id — membership via company_users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name          VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure name column exists on older installs
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- ============================================================
-- 3. COMPANY_USERS (many-to-many ready; one company per user for now)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users (company_id);

-- Migrate direct user → company_profile links into company_users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'company_profile_id'
  ) THEN
    INSERT INTO company_users (company_id, user_id)
    SELECT company_profile_id, id
    FROM users
    WHERE company_profile_id IS NOT NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 4. Rename company_profile_id → company_id on tenant tables
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clients', 'products', 'quotation_templates',
    'quotations', 'default_terms'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'company_profile_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'company_id'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I RENAME COLUMN company_profile_id TO company_id',
        tbl
      );
    END IF;
  END LOOP;
END $$;

-- Ensure company_id FK references companies (best-effort for migrated DBs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'clients'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients (company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products (company_id);

-- Repoint tenant FKs from legacy company_profiles → companies
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'company_profiles'
      AND tc.table_name IN (
        'clients', 'products', 'quotation_templates',
        'quotations', 'default_terms'
      )
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', rec.table_name, rec.constraint_name);
  END LOOP;
END $$;

ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clients_company_id_fkey;
ALTER TABLE clients
  ADD CONSTRAINT clients_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_company_id_fkey;
ALTER TABLE products
  ADD CONSTRAINT products_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation_templates') THEN
    ALTER TABLE quotation_templates DROP CONSTRAINT IF EXISTS quotation_templates_company_id_fkey;
    ALTER TABLE quotation_templates
      ADD CONSTRAINT quotation_templates_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotations') THEN
    ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_company_id_fkey;
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'default_terms') THEN
    ALTER TABLE default_terms DROP CONSTRAINT IF EXISTS default_terms_company_id_fkey;
    ALTER TABLE default_terms
      ADD CONSTRAINT default_terms_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop legacy direct company link on users after migration
ALTER TABLE users DROP COLUMN IF EXISTS company_profile_id;
