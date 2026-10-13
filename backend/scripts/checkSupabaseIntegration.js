import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import pool, { testDatabaseConnection } from '../config/database.js'

dotenv.config()

function mask(value) {
  if (!value) return '(missing)'
  if (value.length < 12) return '(set, short)'
  return `${value.slice(0, 6)}...${value.slice(-4)} (len ${value.length})`
}

const checks = []

function pass(name, detail = '') {
  checks.push({ name, ok: true, detail })
}

function fail(name, detail = '') {
  checks.push({ name, ok: false, detail })
}

async function main() {
  console.log('--- Config present ---')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'MISSING')
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING')
  console.log('SUPABASE_STORAGE_BUCKET:', process.env.SUPABASE_STORAGE_BUCKET || 'MISSING')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', mask(process.env.SUPABASE_SERVICE_ROLE_KEY))

  try {
    const ok = await testDatabaseConnection()
    if (ok) pass('PostgreSQL connection', 'SELECT 1 ok')
    else fail('PostgreSQL connection', 'unexpected result')
  } catch (error) {
    fail('PostgreSQL connection', error.message)
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'quotation-templates'

  if (!url || !key) {
    fail('Supabase Storage config', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing')
  } else if (key.includes('eyJ') === false && key.length < 20) {
    fail('Supabase Storage config', 'SERVICE_ROLE_KEY looks empty/invalid')
  } else {
    pass('Supabase Storage config', 'URL + service role key present')

    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await supabase.storage.getBucket(bucket)
      if (error) {
        fail('Storage bucket access', error.message)
      } else if (!data) {
        fail('Storage bucket access', `Bucket "${bucket}" not found`)
      } else {
        pass('Storage bucket access', `bucket="${data.name}" public=${Boolean(data.public)}`)
      }

      // Tiny write/delete probe to confirm upload permissions
      const probePath = `healthchecks/integration-probe-${Date.now()}.txt`
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(probePath, Buffer.from('ok'), {
          contentType: 'text/plain',
          upsert: true,
        })
      if (uploadError) {
        fail('Storage upload permission', uploadError.message)
      } else {
        pass('Storage upload permission', 'probe upload ok')
        await supabase.storage.from(bucket).remove([probePath])
      }
    } catch (error) {
      fail('Supabase Storage client', error.message)
    }
  }

  console.log('\n--- Results ---')
  for (const item of checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`)
  }

  const failed = checks.filter((item) => !item.ok)
  await pool.end().catch(() => {})
  if (failed.length) {
    process.exitCode = 1
  }
}

main()
