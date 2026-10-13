-- Company quotation sequence start, customer GSTIN/reference, quotation validity days + customer snapshots

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS quotation_number_start INTEGER NOT NULL DEFAULT 1;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS gstin VARCHAR(32);

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS validity_days INTEGER,
  ADD COLUMN IF NOT EXISTS customer_gstin_snapshot VARCHAR(32),
  ADD COLUMN IF NOT EXISTS customer_reference_snapshot VARCHAR(100);

-- Ensure existing companies have a sensible start value
UPDATE companies
SET quotation_number_start = 1
WHERE quotation_number_start IS NULL OR quotation_number_start < 1;
