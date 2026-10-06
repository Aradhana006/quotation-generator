-- Migration 002: Quotations as historical transactions (snapshots + child tables)
-- Does not implement PDF, email, WhatsApp, or template field-mapping.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- QUOTATIONS (header + snapshots + cover letter + totals)
-- Cover letter lives on this row so an old quote never reads a live template.
-- Bank/signature are snapshot columns for the same reason.
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quotation_number               VARCHAR(50) NOT NULL,
  status                         VARCHAR(20) NOT NULL DEFAULT 'draft',
  quotation_date                 DATE,
  valid_until                    DATE,
  reference_number               VARCHAR(100),
  subject                        VARCHAR(500),
  currency                       VARCHAR(10) NOT NULL DEFAULT 'INR',
  customer_id                    UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_company_name          VARCHAR(255),
  customer_contact_person        VARCHAR(255),
  customer_email                 VARCHAR(255),
  customer_phone                 VARCHAR(50),
  customer_address               TEXT,
  company_name_snapshot          VARCHAR(255),
  company_logo_snapshot          TEXT,
  company_address_snapshot       TEXT,
  company_phone_snapshot         VARCHAR(50),
  company_email_snapshot         VARCHAR(255),
  company_website_snapshot       VARCHAR(255),
  company_gstin_snapshot         VARCHAR(50),
  cover_letter_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  cover_letter_greeting          TEXT,
  cover_letter_attention         TEXT,
  cover_letter_subject           TEXT,
  cover_letter_message           TEXT,
  cover_letter_closing           TEXT,
  cover_letter_sign_off_company  TEXT,
  cover_letter_sign_off_title    TEXT,
  notes                          TEXT,
  payment_terms                  TEXT,
  delivery_terms                 TEXT,
  template_type                  VARCHAR(20) NOT NULL DEFAULT 'builtin',
  template_id                    VARCHAR(100) NOT NULL DEFAULT 'modern',
  bank_account_name_snapshot     VARCHAR(255),
  bank_account_number_snapshot   VARCHAR(100),
  bank_name_snapshot             VARCHAR(255),
  bank_branch_snapshot           VARCHAR(255),
  bank_ifsc_snapshot             VARCHAR(50),
  signature_name_snapshot        VARCHAR(255),
  signature_designation_snapshot VARCHAR(255),
  signature_image_snapshot       TEXT,
  subtotal                       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_discount                 NUMERIC(14, 2) NOT NULL DEFAULT 0,
  taxable_amount                 NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_tax                      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  additional_charges_total       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  grand_total                    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy column renames (old schema from earlier local setup)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'client_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE quotations RENAME COLUMN client_id TO customer_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'snap_client_company_name'
  ) THEN
    ALTER TABLE quotations RENAME COLUMN snap_client_company_name TO customer_company_name;
    ALTER TABLE quotations RENAME COLUMN snap_client_contact_person TO customer_contact_person;
    ALTER TABLE quotations RENAME COLUMN snap_client_email TO customer_email;
    ALTER TABLE quotations RENAME COLUMN snap_client_phone TO customer_phone;
    ALTER TABLE quotations RENAME COLUMN snap_client_address TO customer_address;
    ALTER TABLE quotations RENAME COLUMN snap_company_name TO company_name_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_logo TO company_logo_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_address TO company_address_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_phone TO company_phone_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_email TO company_email_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_website TO company_website_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_company_gstin TO company_gstin_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_bank_account_name TO bank_account_name_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_bank_account_number TO bank_account_number_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_bank_name TO bank_name_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_bank_branch TO bank_branch_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_bank_ifsc TO bank_ifsc_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_signature_name TO signature_name_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_signature_designation TO signature_designation_snapshot;
    ALTER TABLE quotations RENAME COLUMN snap_signature_image TO signature_image_snapshot;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'discount_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'total_discount'
  ) THEN
    ALTER TABLE quotations RENAME COLUMN discount_amount TO total_discount;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'tax_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'total_tax'
  ) THEN
    ALTER TABLE quotations RENAME COLUMN tax_amount TO total_tax;
  END IF;
END $$;

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_company_name VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_contact_person VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_name_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_logo_snapshot TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_address_snapshot TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_phone_snapshot VARCHAR(50);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_email_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_website_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_gstin_snapshot VARCHAR(50);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_greeting TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_attention TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_subject TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_message TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_closing TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_sign_off_company TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cover_letter_sign_off_title TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS delivery_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS template_type VARCHAR(20) NOT NULL DEFAULT 'builtin';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS template_id VARCHAR(100) NOT NULL DEFAULT 'modern';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS bank_account_name_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS bank_account_number_snapshot VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS bank_name_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS bank_branch_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS bank_ifsc_snapshot VARCHAR(50);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signature_name_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signature_designation_snapshot VARCHAR(255);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signature_image_snapshot TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_discount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_tax NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS additional_charges_total NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cover_letters') THEN
    UPDATE quotations q SET
      cover_letter_enabled = COALESCE(cl.enabled, FALSE),
      cover_letter_greeting = cl.greeting,
      cover_letter_attention = cl.kind_attention,
      cover_letter_subject = cl.subject,
      cover_letter_message = cl.message,
      cover_letter_closing = cl.closing,
      cover_letter_sign_off_company = cl.sign_off_company,
      cover_letter_sign_off_title = cl.sign_off_title
    FROM cover_letters cl
    WHERE cl.quotation_id = q.id;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotations_status_check'
  ) THEN
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_status_check
      CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotations_company_number_unique'
  ) THEN
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_company_number_unique UNIQUE (company_id, quotation_number);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotations_company_id ON quotations (company_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations (customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);

-- ============================================================
-- QUOTATION ITEMS (copied product values — never re-read live price)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id           UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id             UUID,
  description_snapshot   TEXT NOT NULL,
  specification_snapshot TEXT,
  quantity               NUMERIC(12, 3) NOT NULL DEFAULT 1,
  unit                   VARCHAR(50),
  unit_price             NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_type          VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate               NUMERIC(6, 2) NOT NULL DEFAULT 0,
  tax_amount             NUMERIC(14, 2) NOT NULL DEFAULT 0,
  line_subtotal          NUMERIC(14, 2) NOT NULL DEFAULT 0,
  line_total             NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotation_items' AND column_name = 'description'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotation_items' AND column_name = 'description_snapshot'
  ) THEN
    ALTER TABLE quotation_items RENAME COLUMN description TO description_snapshot;
    ALTER TABLE quotation_items RENAME COLUMN specification TO specification_snapshot;
  END IF;
END $$;

ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS description_snapshot TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS specification_snapshot TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_total NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotation_items' AND column_name = 'product_id'
      AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE quotation_items
      ALTER COLUMN product_id TYPE UUID USING (
        CASE
          WHEN product_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
            THEN product_id::uuid
          ELSE NULL
        END
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_product_id_fkey'
  ) THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_discount_type_check'
  ) THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_discount_type_check
      CHECK (discount_type IN ('percentage', 'fixed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_quantity_positive'
  ) THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_quantity_positive CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_unit_price_non_negative'
  ) THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_unit_price_non_negative CHECK (unit_price >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items (quotation_id);

-- ============================================================
-- QUOTATION CHARGES
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation_additional_charges'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation_charges'
  ) THEN
    ALTER TABLE quotation_additional_charges RENAME TO quotation_charges;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS quotation_charges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  amount       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_charges_amount_non_negative'
  ) THEN
    ALTER TABLE quotation_charges
      ADD CONSTRAINT quotation_charges_amount_non_negative CHECK (amount >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotation_charges_quotation_id ON quotation_charges (quotation_id);

-- ============================================================
-- QUOTATION TERMS (copied text — master term edits do not affect old quotes)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_terms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  term_text    TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_terms_quotation_id ON quotation_terms (quotation_id);
