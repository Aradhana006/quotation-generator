/**
 * Proves a failed child insert rolls back the whole quotation.
 * Run: node scripts/testQuotationRollback.js
 */
import dotenv from 'dotenv'
import pool from '../config/database.js'

dotenv.config()

async function run() {
  const company = await pool.query(
    `SELECT id FROM companies ORDER BY created_at DESC LIMIT 1`,
  )
  const companyId = company.rows[0]?.id
  if (!companyId) {
    console.error('Rollback test skipped: no company found. Register a user first.')
    await pool.end()
    process.exit(1)
  }

  const before = await pool.query(
    `SELECT COUNT(*)::int AS count FROM quotations WHERE company_id = $1`,
    [companyId],
  )
  const countBefore = before.rows[0].count

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const inserted = await client.query(
      `INSERT INTO quotations (company_id, quotation_number, customer_company_name, status)
       VALUES ($1, $2, $3, 'draft')
       RETURNING id`,
      [companyId, `ROLLBACK-TEST-${Date.now()}`, 'Rollback Test Customer'],
    )
    const quotationId = inserted.rows[0].id

    await client.query(
      `INSERT INTO quotation_items (quotation_id, description_snapshot, quantity, unit_price)
       VALUES ($1, $2, $3, $4)`,
      [quotationId, 'Should fail CHECK', 0, 100],
    )

    await client.query('COMMIT')
    console.error('Rollback test FAILED: invalid item was accepted.')
    process.exitCode = 1
  } catch (error) {
    await client.query('ROLLBACK')
    const after = await pool.query(
      `SELECT COUNT(*)::int AS count FROM quotations WHERE company_id = $1`,
      [companyId],
    )
    const countAfter = after.rows[0].count
    if (countAfter === countBefore) {
      console.log('Rollback test passed: invalid item rolled back the quotation.')
    } else {
      console.error('Rollback test FAILED: quotation count changed after rollback.')
      process.exitCode = 1
    }
    if (!error.message.includes('quotation_items_quantity_positive')) {
      console.log('Database rejected the child insert:', error.message)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

run()
