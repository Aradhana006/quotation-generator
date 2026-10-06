import pool from '../config/database.js'

export async function getDefaultTerms(companyId) {
  const result = await pool.query(
    `SELECT term_text FROM default_terms
     WHERE company_id = $1
     ORDER BY sort_order ASC`,
    [companyId],
  )
  return result.rows.map((row) => row.term_text)
}

export async function saveDefaultTerms(terms, companyId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM default_terms WHERE company_id = $1`, [companyId])
    for (let i = 0; i < terms.length; i += 1) {
      await client.query(
        `INSERT INTO default_terms (company_id, term_text, sort_order) VALUES ($1, $2, $3)`,
        [companyId, terms[i], i + 1],
      )
    }
    await client.query('COMMIT')
    return terms
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
