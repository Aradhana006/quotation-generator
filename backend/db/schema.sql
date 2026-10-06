-- Quotation Generator — Full relational schema
-- Run: npm run db:setup (from backend folder)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. COMPANIES (tenant root + profile/settings fields)
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

-- ============================================================
-- 2. USERS (credentials only — company link via company_users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2b. COMPANY_USERS (membership — supports future multi-user companies)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users (company_id);

-- ============================================================
-- 3. CLIENTS (customers in the UI)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name        VARCHAR(255) NOT NULL,
  contact_person      VARCHAR(255),
  email               VARCHAR(255),
  phone               VARCHAR(50),
  address             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients (company_id);

-- Migrate legacy customers table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    INSERT INTO clients (id, company_id, company_name, contact_person, email, phone, address, created_at, updated_at)
    SELECT
      c.id,
      COALESCE(
        (SELECT id FROM companies LIMIT 1),
        '00000000-0000-0000-0000-000000000001'::uuid
      ),
      c.company_name,
      c.contact_person,
      c.email,
      c.phone,
      c.address,
      c.created_at,
      c.updated_at
    FROM customers c
    ON CONFLICT (id) DO NOTHING;
    DROP TABLE customers;
  END IF;
END $$;

-- ============================================================
-- 3b. PRODUCTS (master data — reusable catalogue items)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  unit                VARCHAR(50) NOT NULL DEFAULT '',
  default_price       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  default_tax         NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products (company_id);

-- ============================================================
-- 4. QUOTATION TEMPLATES (custom uploads; built-in are code-defined)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                VARCHAR(20) NOT NULL DEFAULT 'custom',
  template_key        VARCHAR(100),
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  file_name           VARCHAR(255),
  file_type           VARCHAR(100),
  file_data           TEXT,
  preview_data        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_templates_company ON quotation_templates (company_id);

-- ============================================================
-- 5. QUOTATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id                   UUID REFERENCES clients(id) ON DELETE SET NULL,
  quotation_number            VARCHAR(50) NOT NULL,
  quotation_date              DATE,
  valid_until                 DATE,
  reference_number            VARCHAR(100),
  subject                     VARCHAR(500),
  currency                    VARCHAR(10) NOT NULL DEFAULT 'INR',
  status                      VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes                       TEXT,
  payment_terms               TEXT,
  delivery_terms              TEXT,
  subtotal                    NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount             NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount                  NUMERIC(14,2) NOT NULL DEFAULT 0,
  additional_charges_total    NUMERIC(14,2) NOT NULL DEFAULT 0,
  grand_total                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  template_type               VARCHAR(20) NOT NULL DEFAULT 'builtin',
  template_id                 VARCHAR(100) NOT NULL DEFAULT 'modern',
  -- Client snapshot
  snap_client_company_name    VARCHAR(255),
  snap_client_contact_person  VARCHAR(255),
  snap_client_email           VARCHAR(255),
  snap_client_phone           VARCHAR(50),
  snap_client_address         TEXT,
  -- Company snapshot
  snap_company_name           VARCHAR(255),
  snap_company_logo           TEXT,
  snap_company_address        TEXT,
  snap_company_phone          VARCHAR(50),
  snap_company_email          VARCHAR(255),
  snap_company_website        VARCHAR(255),
  snap_company_gstin          VARCHAR(50),
  -- Bank snapshot
  snap_bank_account_name      VARCHAR(255),
  snap_bank_account_number    VARCHAR(100),
  snap_bank_name              VARCHAR(255),
  snap_bank_branch            VARCHAR(255),
  snap_bank_ifsc              VARCHAR(50),
  -- Signature snapshot
  snap_signature_name         VARCHAR(255),
  snap_signature_designation  VARCHAR(255),
  snap_signature_image        TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, quotation_number)
);

CREATE INDEX IF NOT EXISTS idx_quotations_company ON quotations (company_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations (client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);

-- ============================================================
-- 6. COVER LETTERS (1:1 with quotation)
-- ============================================================
CREATE TABLE IF NOT EXISTS cover_letters (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id        UUID NOT NULL UNIQUE REFERENCES quotations(id) ON DELETE CASCADE,
  enabled             BOOLEAN NOT NULL DEFAULT FALSE,
  greeting            TEXT,
  kind_attention      TEXT,
  subject             TEXT,
  message             TEXT,
  closing             TEXT,
  sign_off_company    TEXT,
  sign_off_title      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. QUOTATION ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id          VARCHAR(100),
  description         TEXT NOT NULL,
  specification       TEXT,
  quantity            NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit                VARCHAR(50),
  unit_price          NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_type       VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value      NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate            NUMERIC(6,2) NOT NULL DEFAULT 0,
  line_total          NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items (quotation_id);

-- ============================================================
-- 8. QUOTATION TERMS
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_terms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  term_text           TEXT NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_terms_quotation ON quotation_terms (quotation_id);

-- ============================================================
-- Additional charges (needed by existing UI)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_additional_charges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  name                VARCHAR(255) NOT NULL,
  amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_charges_quotation ON quotation_additional_charges (quotation_id);

-- ============================================================
-- Default terms library (reusable master terms per company)
-- ============================================================
CREATE TABLE IF NOT EXISTS default_terms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  term_text           TEXT NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No seed users — accounts are created via POST /api/auth/register
