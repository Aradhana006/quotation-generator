import pool from '../config/database.js'

function mapRowToProduct(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description || '',
    unit: row.unit || '',
    defaultPrice: Number(row.default_price),
    defaultTax: Number(row.default_tax),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createProduct(productData, companyId) {
  const result = await pool.query(
    `INSERT INTO products
      (company_id, name, description, unit, default_price, default_tax)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      companyId,
      productData.name.trim(),
      productData.description?.trim() || null,
      productData.unit.trim(),
      productData.defaultPrice,
      productData.defaultTax ?? 0,
    ],
  )
  return mapRowToProduct(result.rows[0])
}

export async function getProducts(companyId) {
  const result = await pool.query(
    `SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC`,
    [companyId],
  )
  return result.rows.map(mapRowToProduct)
}

export async function getProductById(id, companyId) {
  const result = await pool.query(
    `SELECT * FROM products WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  )
  return result.rows[0] ? mapRowToProduct(result.rows[0]) : null
}

export async function updateProduct(id, productData, companyId) {
  const result = await pool.query(
    `UPDATE products SET
       name = $1, description = $2, unit = $3,
       default_price = $4, default_tax = $5, updated_at = NOW()
     WHERE id = $6 AND company_id = $7
     RETURNING *`,
    [
      productData.name.trim(),
      productData.description?.trim() || null,
      productData.unit.trim(),
      productData.defaultPrice,
      productData.defaultTax ?? 0,
      id,
      companyId,
    ],
  )
  return result.rows[0] ? mapRowToProduct(result.rows[0]) : null
}

export async function deleteProduct(id, companyId) {
  const result = await pool.query(
    `DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, companyId],
  )
  return result.rows.length > 0
}
