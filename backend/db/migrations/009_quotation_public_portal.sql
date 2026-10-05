-- Migration 009: Customer public links and quotation responses.

CREATE TABLE IF NOT EXISTS quotation_public_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id     UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  token_hash       VARCHAR(64) NOT NULL UNIQUE,
  expires_at       TIMESTAMPTZ NOT NULL,
  revoked_at       TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_public_links_quotation
  ON quotation_public_links (company_id, quotation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS quotation_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id   UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  public_link_id UUID REFERENCES quotation_public_links(id) ON DELETE SET NULL,
  response_type  VARCHAR(30) NOT NULL,
  customer_name  VARCHAR(255),
  customer_email VARCHAR(255),
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotation_responses_type_check
    CHECK (response_type IN ('accepted', 'rejected', 'changes_requested'))
);

CREATE INDEX IF NOT EXISTS idx_quotation_responses_quotation
  ON quotation_responses (company_id, quotation_id, created_at DESC);
