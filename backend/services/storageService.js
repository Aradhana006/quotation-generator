import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_UPLOAD_ROOT = path.join(__dirname, '..', 'uploads')
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'quotation-templates'
const SIGNED_URL_SECONDS = 60 * 60

function usesSupabaseStorage() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function buildStoragePath(companyId, templateId, fileName) {
  return `templates/${companyId}/${templateId}/${fileName}`
}

async function ensureBucket(supabase) {
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (data) return
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false })
  if (error && !String(error.message).toLowerCase().includes('already exists')) {
    throw error
  }
}

export async function uploadTemplateFile({ companyId, templateId, fileName, buffer, contentType }) {
  const storagePath = buildStoragePath(companyId, templateId, fileName)

  if (usesSupabaseStorage()) {
    const supabase = getSupabaseAdmin()
    await ensureBucket(supabase)
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })
    if (error) {
      console.error('Supabase Storage upload failed:', error.message)
      throw new Error('Upload failed.')
    }
    return { driver: 'supabase', storagePath }
  }

  const absolute = path.join(LOCAL_UPLOAD_ROOT, storagePath)
  await fs.mkdir(path.dirname(absolute), { recursive: true })
  await fs.writeFile(absolute, buffer)
  return { driver: 'local', storagePath }
}

export async function deleteTemplateFile(storagePath) {
  if (!storagePath) return

  if (usesSupabaseStorage()) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
    if (error) {
      console.error('Supabase Storage delete failed:', error.message)
      throw new Error('Unable to delete stored file.')
    }
    return
  }

  const absolute = path.join(LOCAL_UPLOAD_ROOT, storagePath)
  try {
    await fs.unlink(absolute)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Local file delete failed:', error.message)
      throw new Error('Unable to delete stored file.')
    }
  }
}

export async function createFileAccessUrl(storagePath) {
  if (!storagePath) return null

  if (usesSupabaseStorage()) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_SECONDS)
    if (error) {
      console.error('Supabase signed URL failed:', error.message)
      return null
    }
    return data?.signedUrl || null
  }

  const exp = Math.floor(Date.now() / 1000) + SIGNED_URL_SECONDS
  const sig = signLocalPath(storagePath, exp)
  const apiBase = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`
  return `${apiBase}/api/templates/file?path=${encodeURIComponent(storagePath)}&exp=${exp}&sig=${sig}`
}

export function signLocalPath(storagePath, exp) {
  const secret = process.env.SESSION_SECRET || 'dev-only-session-secret-change-me'
  return crypto.createHmac('sha256', secret).update(`${storagePath}:${exp}`).digest('hex')
}

export function verifyLocalFileToken(storagePath, exp, sig) {
  if (!storagePath || !exp || !sig) return false
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false
  const expected = signLocalPath(storagePath, exp)
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

export function resolveLocalFilePath(storagePath) {
  const absolute = path.resolve(LOCAL_UPLOAD_ROOT, storagePath)
  if (!absolute.startsWith(path.resolve(LOCAL_UPLOAD_ROOT))) {
    return null
  }
  return absolute
}

export async function readStoredFileBuffer(storagePath) {
  if (!storagePath) return null

  if (usesSupabaseStorage()) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)
    if (error || !data) {
      console.error('Supabase Storage download failed:', error?.message)
      return null
    }
    return Buffer.from(await data.arrayBuffer())
  }

  const absolute = resolveLocalFilePath(storagePath)
  if (!absolute) return null
  try {
    return await fs.readFile(absolute)
  } catch (error) {
    console.error('Local file read failed:', error.message)
    return null
  }
}

export function getStorageDriverLabel() {
  return usesSupabaseStorage() ? 'Supabase Storage' : 'local disk'
}
