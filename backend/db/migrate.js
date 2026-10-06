import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from '../config/database.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, 'migrations')

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getAppliedMigrations() {
  const result = await pool.query(
    `SELECT filename FROM schema_migrations ORDER BY filename`,
  )
  return new Set(result.rows.map((row) => row.filename))
}

async function applyMigration(filename, sql) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query(
      `INSERT INTO schema_migrations (filename) VALUES ($1)`,
      [filename],
    )
    await client.query('COMMIT')
    console.log(`Migration applied: ${filename}`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(`Migration failed: ${filename}`)
    throw error
  } finally {
    client.release()
  }
}

async function migrate() {
  try {
    await ensureMigrationsTable()

    const applied = await getAppliedMigrations()
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('No migration files found.')
      return
    }

    let ran = 0
    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`Migration skipped (already applied): ${filename}`)
        continue
      }

      const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8')
      await applyMigration(filename, sql)
      ran += 1
    }

    if (ran === 0) {
      console.log('Database migrations are up to date.')
    } else {
      console.log(`${ran} migration(s) applied successfully.`)
    }
  } catch (error) {
    console.error('Migration run failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
