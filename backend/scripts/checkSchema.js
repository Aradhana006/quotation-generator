import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const tables = ['customers', 'products', 'companies', 'company_users', 'users']
for (const table of tables) {
  const result = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = $1 ORDER BY ordinal_position`,
    [table],
  )
  console.log(`\n${table}:`, result.rows.map((r) => r.column_name).join(', '))
}

await pool.end()
