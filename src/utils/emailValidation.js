const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  if (typeof value !== 'string') return false
  const email = value.trim()
  if (!email || email.length > 254) return false
  return EMAIL_PATTERN.test(email)
}
