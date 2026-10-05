-- Migration 010: Recoverable public tokens for business Copy Link (encrypted at rest).
-- Lookup still uses token_hash. Raw tokens are never stored in plaintext.

ALTER TABLE quotation_public_links
  ADD COLUMN IF NOT EXISTS token_cipher TEXT;
