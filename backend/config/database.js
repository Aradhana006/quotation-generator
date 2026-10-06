import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

/**
 * PostgreSQL connection pool.
 *
 * Supabase: set DATABASE_URL in .env (Session pooler or direct connection).
 * Local dev fallback: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
 *
 * The pool reuses connections instead of opening a new one per query.
 */
function createPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.DB_POOL_MAX) || 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'quotation_generator',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  }
}

const pool = new pg.Pool(createPoolConfig())

pool.on('error', (error) => {
  console.error('PostgreSQL pool error:', error.message)
})

export async function testDatabaseConnection() {
  const result = await pool.query('SELECT 1 AS ok')
  return result.rows[0]?.ok === 1
}

export async function logDatabaseConnectionStatus() {
  try {
    await testDatabaseConnection()
    const target = process.env.DATABASE_URL ? 'Supabase PostgreSQL' : 'PostgreSQL'
    console.log(`Database connection successful (${target}).`)
  } catch (error) {
    console.error('Database connection failed:', error.message)
  }
}

export default pool
