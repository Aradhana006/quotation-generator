import pool from '../config/database.js'

function mapDeliveryRow(row) {
  return {
    id: row.id,
    quotationId: row.quotation_id,
    companyId: row.company_id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name || '',
    subject: row.subject,
    message: row.message,
    status: row.status,
    revisionNumber: row.revision_number,
    pdfFilename: row.pdf_filename || '',
    providerMessageId: row.provider_message_id || null,
    errorCode: row.error_code || null,
    errorMessage: row.error_message || null,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPublicDelivery(row) {
  return {
    id: row.id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name || '',
    subject: row.subject,
    status: row.status,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    revisionNumber: row.revision_number,
    pdfFilename: row.pdf_filename || '',
    failureReason: row.status === 'failed' ? row.error_message || 'Unable to send quotation.' : null,
  }
}

export async function createDelivery(delivery) {
  const result = await pool.query(
    `INSERT INTO quotation_deliveries (
       quotation_id, company_id, sent_by_user_id, recipient_email, recipient_name,
       subject, message, status, revision_number, pdf_filename
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
     RETURNING *`,
    [
      delivery.quotationId,
      delivery.companyId,
      delivery.userId || null,
      delivery.recipientEmail,
      delivery.recipientName || null,
      delivery.subject,
      delivery.message,
      delivery.revisionNumber ?? 0,
      delivery.pdfFilename || null,
    ],
  )
  return mapDeliveryRow(result.rows[0])
}

export async function markDeliverySent(id, companyId, providerMessageId) {
  const result = await pool.query(
    `UPDATE quotation_deliveries
     SET status = 'sent',
         provider_message_id = $3,
         error_code = NULL,
         error_message = NULL,
         sent_at = NOW(),
         updated_at = NOW()
     WHERE id = $1 AND company_id = $2
     RETURNING *`,
    [id, companyId, providerMessageId || null],
  )
  return result.rows[0] ? mapDeliveryRow(result.rows[0]) : null
}

export async function markDeliveryFailed(id, companyId, errorCode, errorMessage) {
  const result = await pool.query(
    `UPDATE quotation_deliveries
     SET status = 'failed',
         error_code = $3,
         error_message = $4,
         updated_at = NOW()
     WHERE id = $1 AND company_id = $2
     RETURNING *`,
    [id, companyId, errorCode || 'EMAIL_SEND_FAILED', errorMessage || 'Unable to send quotation.'],
  )
  return result.rows[0] ? mapDeliveryRow(result.rows[0]) : null
}

export async function getDeliveriesForQuotation(quotationId, companyId) {
  const owned = await pool.query(
    `SELECT id FROM quotations WHERE id = $1 AND company_id = $2`,
    [quotationId, companyId],
  )
  if (!owned.rows[0]) return null

  const result = await pool.query(
    `SELECT id, recipient_email, recipient_name, subject, status, sent_at, created_at,
            revision_number, pdf_filename, error_message
     FROM quotation_deliveries
     WHERE quotation_id = $1 AND company_id = $2
     ORDER BY created_at DESC`,
    [quotationId, companyId],
  )

  return result.rows.map(mapPublicDelivery)
}

export async function hasRecentSendAttempt(quotationId, companyId, windowMs = 8000) {
  const result = await pool.query(
    `SELECT id FROM quotation_deliveries
     WHERE quotation_id = $1
       AND company_id = $2
       AND status = 'pending'
       AND created_at > NOW() - ($3 * INTERVAL '1 millisecond')
     LIMIT 1`,
    [quotationId, companyId, windowMs],
  )
  return Boolean(result.rows[0])
}
