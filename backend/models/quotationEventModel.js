import pool from '../config/database.js'

export async function recordEvent(clientOrPool, event) {
  const db = clientOrPool || pool
  await db.query(
    `INSERT INTO quotation_events (
       company_id, quotation_id, quote_group_id, user_id, action, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      event.companyId,
      event.quotationId || null,
      event.quoteGroupId || null,
      event.userId || null,
      event.action,
      JSON.stringify(event.metadata || {}),
    ],
  )
}

export async function getQuotationHistory(quotationId, companyId) {
  const owned = await pool.query(
    `SELECT id, quote_group_id FROM quotations WHERE id = $1 AND company_id = $2`,
    [quotationId, companyId],
  )
  if (!owned.rows[0]) return null

  const result = await pool.query(
    `SELECT
       e.id, e.action, e.metadata, e.created_at, e.quotation_id,
       u.name AS user_name, u.email AS user_email
     FROM quotation_events e
     LEFT JOIN users u ON u.id = e.user_id
     WHERE e.company_id = $1
       AND (e.quote_group_id = $2 OR e.quotation_id = $3)
     ORDER BY e.created_at ASC`,
    [companyId, owned.rows[0].quote_group_id, quotationId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    action: row.action,
    quotationId: row.quotation_id,
    user: row.user_name || row.user_email || null,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    from: row.metadata?.fromStatus,
    to: row.metadata?.toStatus,
    revision: row.metadata?.revisionNumber,
  }))
}

export async function shouldRecordCustomerView(quotationId, companyId) {
  const result = await pool.query(
    `SELECT id FROM quotation_events
     WHERE quotation_id = $1
       AND company_id = $2
       AND action = 'customer_viewed'
       AND created_at > NOW() - INTERVAL '10 minutes'
     LIMIT 1`,
    [quotationId, companyId],
  )
  return !result.rows[0]
}
