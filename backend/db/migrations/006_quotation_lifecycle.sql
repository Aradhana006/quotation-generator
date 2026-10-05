-- Migration 006: Quotation revisions, archive, audit events, and number sequences.

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quote_group_id UUID;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS revision_number INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS is_latest BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE quotations SET quote_group_id = id WHERE quote_group_id IS NULL;
ALTER TABLE quotations ALTER COLUMN quote_group_id SET NOT NULL;

ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_company_number_unique;
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;

ALTER TABLE quotations
  ADD CONSTRAINT quotations_status_check
  CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotations_company_number_revision_unique'
  ) THEN
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_company_number_revision_unique
      UNIQUE (company_id, quotation_number, revision_number);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotations_one_latest
  ON quotations (company_id, quote_group_id)
  WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_quotations_quote_group
  ON quotations (company_id, quote_group_id, revision_number);

CREATE INDEX IF NOT EXISTS idx_quotations_archived_at
  ON quotations (company_id, archived_at);

CREATE INDEX IF NOT EXISTS idx_quotations_list_search
  ON quotations (company_id, quotation_number, customer_company_name);

CREATE TABLE IF NOT EXISTS quotation_number_sequences (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year       INTEGER NOT NULL,
  last_value INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (company_id, year)
);

INSERT INTO quotation_number_sequences (company_id, year, last_value)
SELECT
  company_id,
  COALESCE(SUBSTRING(quotation_number FROM '^QT-([0-9]{4})-')::INTEGER, EXTRACT(YEAR FROM created_at)::INTEGER),
  MAX(
    COALESCE(NULLIF(SUBSTRING(quotation_number FROM '^QT-[0-9]{4}-([0-9]+)$'), '')::INTEGER, 0)
  )
FROM quotations
GROUP BY
  company_id,
  COALESCE(SUBSTRING(quotation_number FROM '^QT-([0-9]{4})-')::INTEGER, EXTRACT(YEAR FROM created_at)::INTEGER)
ON CONFLICT (company_id, year) DO UPDATE
SET last_value = GREATEST(quotation_number_sequences.last_value, EXCLUDED.last_value);

CREATE TABLE IF NOT EXISTS quotation_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quotation_id   UUID REFERENCES quotations(id) ON DELETE SET NULL,
  quote_group_id UUID,
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  action         VARCHAR(50) NOT NULL,
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_events_group
  ON quotation_events (company_id, quote_group_id, created_at);

CREATE INDEX IF NOT EXISTS idx_quotation_events_quotation
  ON quotation_events (quotation_id, created_at);
