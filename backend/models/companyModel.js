import pool from '../config/database.js'

function mapRowToCompany(row) {
  const start = Number(row.quotation_number_start)
  return {
    id: row.id,
    name: row.name || '',
    logo: row.logo || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    gstin: row.gstin || '',
    quotationNumberStart: Number.isFinite(start) && start >= 1 ? Math.floor(start) : 1,
    bankDetails: {
      accountName: row.bank_account_name || '',
      accountNumber: row.bank_account_number || '',
      bankName: row.bank_name || '',
      branch: row.bank_branch || '',
      ifsc: row.bank_ifsc || '',
    },
    signatory: {
      name: row.signatory_name || '',
      designation: row.signatory_designation || 'Authorised Signatory',
      signature: row.signatory_signature || '',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function syncSequenceBaseline(companyId, start) {
  const year = new Date().getFullYear()
  const baseline = Math.max(0, Number(start) - 1)
  await pool.query(
    `INSERT INTO quotation_number_sequences (company_id, year, last_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (company_id, year)
     DO UPDATE SET last_value = GREATEST(quotation_number_sequences.last_value, EXCLUDED.last_value)`,
    [companyId, year, baseline],
  )
}

export async function createCompany(name) {
  const result = await pool.query(
    `INSERT INTO companies (name) VALUES ($1) RETURNING *`,
    [name.trim()],
  )
  return mapRowToCompany(result.rows[0])
}

export async function linkUserToCompany(userId, companyId) {
  await pool.query(
    `INSERT INTO company_users (company_id, user_id) VALUES ($1, $2)`,
    [companyId, userId],
  )
}

export async function getCompanyById(companyId) {
  const result = await pool.query(`SELECT * FROM companies WHERE id = $1`, [companyId])
  return result.rows[0] ? mapRowToCompany(result.rows[0]) : null
}

export async function updateCompany(companyId, data) {
  const startRaw = Number(data.quotationNumberStart)
  const quotationNumberStart = Number.isFinite(startRaw) && startRaw >= 1 ? Math.floor(startRaw) : 1

  const result = await pool.query(
    `UPDATE companies SET
       name = $1, logo = $2, address = $3, phone = $4, email = $5,
       website = $6, gstin = $7, quotation_number_start = $8,
       bank_account_name = $9, bank_account_number = $10,
       bank_name = $11, bank_branch = $12, bank_ifsc = $13,
       signatory_name = $14, signatory_designation = $15, signatory_signature = $16,
       updated_at = NOW()
     WHERE id = $17
     RETURNING *`,
    [
      data.name?.trim() || '',
      data.logo || null,
      data.address?.trim() || null,
      data.phone?.trim() || null,
      data.email?.trim() || null,
      data.website?.trim() || null,
      data.gstin?.trim()?.toUpperCase() || null,
      quotationNumberStart,
      data.bankDetails?.accountName?.trim() || null,
      data.bankDetails?.accountNumber?.trim() || null,
      data.bankDetails?.bankName?.trim() || null,
      data.bankDetails?.branch?.trim() || null,
      data.bankDetails?.ifsc?.trim()?.toUpperCase() || null,
      data.signatory?.name?.trim() || null,
      data.signatory?.designation?.trim() || 'Authorised Signatory',
      data.signatory?.signature || null,
      companyId,
    ],
  )

  const company = result.rows[0] ? mapRowToCompany(result.rows[0]) : null
  if (company) {
    await syncSequenceBaseline(companyId, company.quotationNumberStart)
  }
  return company
}
