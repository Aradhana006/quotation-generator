import pool from '../config/database.js'

export async function invalidateActiveTokensForUser(userId) {
  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1
       AND used_at IS NULL
       AND expires_at > NOW()`,
    [userId],
  )
}

export async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt],
  )
  return result.rows[0]
}

export async function findValidTokenByHash(tokenHash) {
  const result = await pool.query(
    `SELECT t.*, u.email, u.name
     FROM password_reset_tokens t
     INNER JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = $1
       AND t.used_at IS NULL
       AND t.expires_at > NOW()`,
    [tokenHash],
  )
  return result.rows[0] || null
}

export async function markTokenUsed(tokenId) {
  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE id = $1`,
    [tokenId],
  )
}

export async function updateUserPassword(userId, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [userId, passwordHash],
  )
}
