import pool from '../config/database.js'

function mapRowToClient(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name,
    contactPerson: row.contact_person || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createCustomer(customerData, companyId) {
  const result = await pool.query(
    `INSERT INTO customers
      (company_id, company_name, contact_person, email, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      companyId,
      customerData.companyName.trim(),
      customerData.contactPerson?.trim() || null,
      customerData.email?.trim() || null,
      customerData.phone?.trim() || null,
      customerData.address?.trim() || null,
    ],
  )
  return mapRowToClient(result.rows[0])
}

export async function getCustomers(companyId) {
  const result = await pool.query(
    `SELECT * FROM customers WHERE company_id = $1 ORDER BY created_at DESC`,
    [companyId],
  )
  return result.rows.map(mapRowToClient)
}

export async function getCustomerById(id, companyId) {
  const result = await pool.query(
    `SELECT * FROM customers WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  )
  return result.rows[0] ? mapRowToClient(result.rows[0]) : null
}

export async function updateCustomer(id, customerData, companyId) {
  const result = await pool.query(
    `UPDATE customers SET
       company_name = $1, contact_person = $2, email = $3,
       phone = $4, address = $5, updated_at = NOW()
     WHERE id = $6 AND company_id = $7
     RETURNING *`,
    [
      customerData.companyName.trim(),
      customerData.contactPerson?.trim() || null,
      customerData.email?.trim() || null,
      customerData.phone?.trim() || null,
      customerData.address?.trim() || null,
      id,
      companyId,
    ],
  )
  return result.rows[0] ? mapRowToClient(result.rows[0]) : null
}

export async function deleteCustomer(id, companyId) {
  const result = await pool.query(
    `DELETE FROM customers WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, companyId],
  )
  return result.rows.length > 0
}
