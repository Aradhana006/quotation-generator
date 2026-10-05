import pool from '../config/database.js'
import {
  buildPublicViewUrl,
  decryptPublicToken,
  encryptPublicToken,
  generatePublicToken,
  getPublicLinkTtlDays,
  hashPublicToken,
  isWellFormedPublicToken,
} from '../utils/publicToken.js'

function mapLinkRow(row, { includeUrl = false } = {}) {
  const mapped = {
    id: row.id,
    quotationId: row.quotation_id,
    companyId: row.company_id,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    lastAccessedAt: row.last_accessed_at,
    createdAt: row.created_at,
    active: !row.revoked_at && new Date(row.expires_at).getTime() > Date.now(),
  }

  if (includeUrl) {
    const token = decryptPublicToken(row.token_cipher)
    mapped.url = token ? buildPublicViewUrl(token) : null
  }

  return mapped
}

export async function createPublicLink({ quotationId, companyId }) {
  const token = generatePublicToken()
  const tokenHash = hashPublicToken(token)
  const tokenCipher = encryptPublicToken(token)
  const ttlDays = getPublicLinkTtlDays()

  const result = await pool.query(
    `INSERT INTO quotation_public_links (
       quotation_id, company_id, token_hash, token_cipher, expires_at
     ) VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 day'))
     RETURNING *`,
    [quotationId, companyId, tokenHash, tokenCipher, ttlDays],
  )

  const link = mapLinkRow(result.rows[0], { includeUrl: true })
  return {
    ...link,
    token,
    url: buildPublicViewUrl(token),
  }
}

export async function findLinkByToken(token) {
  if (!isWellFormedPublicToken(token)) return { error: 'LINK_INVALID' }

  const result = await pool.query(
    `SELECT * FROM quotation_public_links WHERE token_hash = $1`,
    [hashPublicToken(token)],
  )
  const row = result.rows[0]
  if (!row) return { error: 'LINK_INVALID' }
  if (row.revoked_at) return { error: 'LINK_REVOKED' }
  if (new Date(row.expires_at).getTime() <= Date.now()) return { error: 'LINK_EXPIRED' }

  return { link: mapLinkRow(row) }
}

export async function touchPublicLink(id) {
  await pool.query(
    `UPDATE quotation_public_links SET last_accessed_at = NOW() WHERE id = $1`,
    [id],
  )
}

export async function getActivePublicLink(quotationId, companyId) {
  const owned = await pool.query(
    `SELECT id FROM quotations WHERE id = $1 AND company_id = $2`,
    [quotationId, companyId],
  )
  if (!owned.rows[0]) return null

  const result = await pool.query(
    `SELECT * FROM quotation_public_links
     WHERE quotation_id = $1
       AND company_id = $2
       AND revoked_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [quotationId, companyId],
  )

  if (!result.rows[0]) {
    return { quotationId, active: null }
  }

  return {
    quotationId,
    active: mapLinkRow(result.rows[0], { includeUrl: true }),
  }
}

export async function revokePublicLinks(quotationId, companyId) {
  const owned = await pool.query(
    `SELECT id FROM quotations WHERE id = $1 AND company_id = $2`,
    [quotationId, companyId],
  )
  if (!owned.rows[0]) return null

  const result = await pool.query(
    `UPDATE quotation_public_links
     SET revoked_at = NOW()
     WHERE quotation_id = $1 AND company_id = $2 AND revoked_at IS NULL
     RETURNING id`,
    [quotationId, companyId],
  )
  return { revoked: result.rowCount }
}
