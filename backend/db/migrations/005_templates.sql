-- Migration 005: Custom quotation templates (metadata only — files live in object storage)

CREATE TABLE IF NOT EXISTS templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  type           VARCHAR(20) NOT NULL DEFAULT 'custom',
  storage_path   TEXT,
  file_url       TEXT,
  file_name      VARCHAR(255),
  file_type      VARCHAR(150),
  file_size      INTEGER NOT NULL DEFAULT 0,
  preview_url    TEXT,
  configuration  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT templates_type_check CHECK (type = 'custom'),
  CONSTRAINT templates_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_templates_company_id ON templates (company_id);

-- Copy metadata from the older quotation_templates table if it exists (files were in DB; not migrated)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'quotation_templates'
  ) THEN
    INSERT INTO templates (
      id, company_id, name, type, file_name, file_type, preview_url, created_at, updated_at
    )
    SELECT
      id,
      company_id,
      name,
      'custom',
      file_name,
      file_type,
      NULL,
      created_at,
      updated_at
    FROM quotation_templates
    WHERE type = 'custom'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
