import pool from '../config/database.js'
import { createFileAccessUrl } from '../services/storageService.js'
import { isPreviewable } from '../utils/fileValidation.js'

async function mapRowToTemplate(row) {
  const accessUrl = await createFileAccessUrl(row.storage_path)
  return {
    id: row.id,
    companyId: row.company_id,
    type: 'custom',
    name: row.name,
    fileUrl: accessUrl,
    fileName: row.file_name || '',
    fileType: row.file_type || '',
    fileSize: Number(row.file_size) || 0,
    previewUrl: isPreviewable(row.file_type) ? accessUrl : null,
    configuration: row.configuration || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    storagePath: row.storage_path || '',
  }
}

export async function getCustomTemplates(companyId) {
  const result = await pool.query(
    `SELECT * FROM templates WHERE company_id = $1 AND type = 'custom' ORDER BY created_at DESC`,
    [companyId],
  )
  return Promise.all(result.rows.map(mapRowToTemplate))
}

export async function getCustomTemplateById(id, companyId) {
  const result = await pool.query(
    `SELECT * FROM templates WHERE id = $1 AND company_id = $2 AND type = 'custom'`,
    [id, companyId],
  )
  return result.rows[0] ? mapRowToTemplate(result.rows[0]) : null
}

export async function createCustomTemplate(data, companyId) {
  const result = await pool.query(
    `INSERT INTO templates (
       id, company_id, name, type, storage_path, file_url, file_name,
       file_type, file_size, preview_url, configuration
     ) VALUES ($1,$2,$3,'custom',$4,$5,$6,$7,$8,$9,'{}'::jsonb)
     RETURNING *`,
    [
      data.id,
      companyId,
      data.name.trim(),
      data.storagePath,
      data.storagePath,
      data.fileName,
      data.fileType,
      data.fileSize,
      null,
    ],
  )
  return mapRowToTemplate(result.rows[0])
}

export async function updateCustomTemplate(id, data, companyId) {
  const result = await pool.query(
    `UPDATE templates SET
       name = COALESCE($1, name),
       storage_path = COALESCE($2, storage_path),
       file_url = COALESCE($2, file_url),
       file_name = COALESCE($3, file_name),
       file_type = COALESCE($4, file_type),
       file_size = COALESCE($5, file_size),
       configuration = COALESCE($6::jsonb, configuration),
       updated_at = NOW()
     WHERE id = $7 AND company_id = $8 AND type = 'custom'
     RETURNING *`,
    [
      data.name?.trim() || null,
      data.storagePath || null,
      data.fileName || null,
      data.fileType || null,
      data.fileSize ?? null,
      data.configuration != null ? JSON.stringify(data.configuration) : null,
      id,
      companyId,
    ],
  )
  return result.rows[0] ? mapRowToTemplate(result.rows[0]) : null
}

export async function deleteCustomTemplate(id, companyId) {
  const result = await pool.query(
    `DELETE FROM templates
     WHERE id = $1 AND company_id = $2 AND type = 'custom'
     RETURNING storage_path`,
    [id, companyId],
  )
  return result.rows[0] || null
}
