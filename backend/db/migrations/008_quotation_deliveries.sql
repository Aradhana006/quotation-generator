-- Migration 008: Quotation email deliveries (send history).
-- Each send creates a new row. Previous deliveries are never overwritten.

CREATE TABLE IF NOT EXISTS quotation_deliveries (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id         UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sent_by_user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_email      VARCHAR(255) NOT NULL,
  recipient_name       VARCHAR(255),
  subject              VARCHAR(255) NOT NULL,
  message              TEXT NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'pending',
  revision_number      INTEGER NOT NULL DEFAULT 0,
  pdf_filename         VARCHAR(255),
  provider_message_id  VARCHAR(255),
  error_code           VARCHAR(80),
  error_message        VARCHAR(255),
  sent_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotation_deliveries_status_check
    CHECK (status IN ('pending', 'sent', 'failed')),
  CONSTRAINT quotation_deliveries_email_not_blank
    CHECK (length(trim(recipient_email)) > 0),
  CONSTRAINT quotation_deliveries_subject_not_blank
    CHECK (length(trim(subject)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_quotation_deliveries_quotation
  ON quotation_deliveries (company_id, quotation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotation_deliveries_status
  ON quotation_deliveries (company_id, status, created_at DESC);
