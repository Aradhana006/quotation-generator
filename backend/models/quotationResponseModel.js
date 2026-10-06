import pool from '../config/database.js'

function mapResponseRow(row) {
  return {
    id: row.id,
    quotationId: row.quotation_id,
    responseType: row.response_type,
    customerName: row.customer_name || '',
    customerEmail: row.customer_email || '',
    comment: row.comment || '',
    createdAt: row.created_at,
  }
}

export async function createResponse(response) {
  const result = await pool.query(
    `INSERT INTO quotation_responses (
       quotation_id, company_id, public_link_id, response_type,
       customer_name, customer_email, comment
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      response.quotationId,
      response.companyId,
      response.publicLinkId || null,
      response.responseType,
      response.customerName || null,
      response.customerEmail || null,
      response.comment || null,
    ],
  )
  return mapResponseRow(result.rows[0])
}

export async function getResponsesForQuotation(quotationId, companyId) {
  const owned = await pool.query(
    `SELECT id FROM quotations WHERE id = $1 AND company_id = $2`,
    [quotationId, companyId],
  )
  if (!owned.rows[0]) return null

  const result = await pool.query(
    `SELECT id, quotation_id, response_type, customer_name, customer_email, comment, created_at
     FROM quotation_responses
     WHERE quotation_id = $1 AND company_id = $2
     ORDER BY created_at DESC`,
    [quotationId, companyId],
  )
  return result.rows.map(mapResponseRow)
}

export async function hasRecentResponse(quotationId, companyId, windowMs = 8000) {
  const result = await pool.query(
    `SELECT id FROM quotation_responses
     WHERE quotation_id = $1
       AND company_id = $2
       AND created_at > NOW() - ($3 * INTERVAL '1 millisecond')
     LIMIT 1`,
    [quotationId, companyId, windowMs],
  )
  return Boolean(result.rows[0])
}
