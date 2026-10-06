import crypto from 'crypto'

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/

function secretKey() {
  return crypto
    .createHash('sha256')
    .update(process.env.SESSION_SECRET || 'dev-only-session-secret-change-me')
    .digest()
}

export function generatePublicToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashPublicToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex')
}

export function isWellFormedPublicToken(token) {
  return TOKEN_PATTERN.test(String(token || ''))
}

export function encryptPublicToken(token) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(token), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export function decryptPublicToken(tokenCipher) {
  if (!tokenCipher) return null
  try {
    const buffer = Buffer.from(String(tokenCipher), 'base64url')
    const iv = buffer.subarray(0, 12)
    const tag = buffer.subarray(12, 28)
    const data = buffer.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

export function getPublicLinkTtlDays() {
  const days = Number(process.env.PUBLIC_LINK_TTL_DAYS || 30)
  return Number.isFinite(days) && days > 0 ? days : 30
}

export function buildPublicViewUrl(token) {
  const origin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  return `${origin}/quote/view/${token}`
}
