import pool from '../config/database.js'

function mapRowToCompany(row) {
  return {
    id: row.id,
    name: row.name || '',
    logo: row.logo || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    gstin: row.gstin || '',
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
  const result = await pool.query(
    `UPDATE companies SET
       name = $1, logo = $2, address = $3, phone = $4, email = $5,
       website = $6, gstin = $7,
       bank_account_name = $8, bank_account_number = $9,
       bank_name = $10, bank_branch = $11, bank_ifsc = $12,
       signatory_name = $13, signatory_designation = $14, signatory_signature = $15,
       updated_at = NOW()
     WHERE id = $16
     RETURNING *`,
    [
      data.name?.trim() || '',
      data.logo || null,
      data.address?.trim() || null,
      data.phone?.trim() || null,
      data.email?.trim() || null,
      data.website?.trim() || null,
      data.gstin?.trim() || null,
      data.bankDetails?.accountName?.trim() || null,
      data.bankDetails?.accountNumber?.trim() || null,
      data.bankDetails?.bankName?.trim() || null,
      data.bankDetails?.branch?.trim() || null,
      data.bankDetails?.ifsc?.trim() || null,
      data.signatory?.name?.trim() || null,
      data.signatory?.designation?.trim() || 'Authorised Signatory',
      data.signatory?.signature || null,
      companyId,
    ],
  )
  return result.rows[0] ? mapRowToCompany(result.rows[0]) : null
}
