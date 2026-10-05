import pool from '../config/database.js'

function mapRowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
    [email.trim()],
  )
  return result.rows[0] || null
}

export async function findUserById(id) {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function createUser({ email, passwordHash, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email.trim().toLowerCase(), passwordHash, name?.trim() || null],
  )
  return mapRowToUser(result.rows[0])
}

export async function getCompanyIdForUser(userId) {
  const result = await pool.query(
    `SELECT company_id FROM company_users WHERE user_id = $1 LIMIT 1`,
    [userId],
  )
  return result.rows[0]?.company_id || null
}
