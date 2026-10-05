-- Migration 003: Align existing quotations tables with Phase 12 snapshot schema.
-- Safe to run after 002 even if the older quotations table already existed.

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

ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS description_snapshot TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS specification_snapshot TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_total NUMERIC(14, 2) NOT NULL DEFAULT 0;

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
