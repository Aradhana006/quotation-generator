import nodemailer from 'nodemailer'

function env(name) {
  let value = String(process.env[name] || '').trim()
  // Common Render paste mistake: KEY=value put into the value field.
  value = value.replace(new RegExp(`^${name}=`, 'i'), '').trim()
  // Strip wrapping quotes from dashboard paste.
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }
  return value
}

function smtpPassword() {
  // Gmail app passwords are 16 chars; spaces are optional in dashboards.
  return env('SMTP_PASS').replace(/\s+/g, '')
}

function smtpConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && smtpPassword())
}

function getFromAddress() {
  const from = env('EMAIL_FROM') || env('SMTP_USER')
  const name = env('EMAIL_FROM_NAME') || 'QuoteBuilder'
  return from ? `"${name}" <${from}>` : null
}

function createTransport() {
  const port = Number(env('SMTP_PORT') || 587)
  const secure = String(env('SMTP_SECURE') || '').toLowerCase() === 'true' || port === 465

  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: env('SMTP_USER'),
      pass: smtpPassword(),
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 20_000,
  })
}

/**
 * Attempt to send email. Returns { sent: boolean, reason?: string }.
 * Never throws to the caller for delivery failures — logs instead.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!smtpConfigured()) {
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }
  }

  const from = getFromAddress()
  if (!from) {
    return { sent: false, reason: 'EMAIL_FROM_MISSING' }
  }

  try {
    const transport = createTransport()
    await transport.sendMail({ from, to, subject, text, html })
    return { sent: true }
  } catch (error) {
    console.error('email send failed:', error.message)
    return {
      sent: false,
      reason: 'SEND_FAILED',
      detail: String(error.message || 'unknown').slice(0, 220),
    }
  }
}

export function isSmtpConfigured() {
  return smtpConfigured()
}

/** Used by /api/health/email so Render SMTP misconfig is visible. */
export async function verifySmtp() {
  if (!smtpConfigured()) {
    return { ok: false, reason: 'SMTP_NOT_CONFIGURED' }
  }
  try {
    const transport = createTransport()
    await transport.verify()
    return { ok: true }
  } catch (error) {
    console.error('SMTP verify failed:', error.message)
    return {
      ok: false,
      reason: 'SMTP_VERIFY_FAILED',
      detail: String(error.message || 'unknown').slice(0, 220),
    }
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : 'Hi,'
  const subject = 'Reset your QuoteBuilder password'
  const text = [
    greeting,
    '',
    'We received a request to reset your QuoteBuilder password.',
    'Open this link to choose a new password (valid for 1 hour):',
    '',
    resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n')

  const html = `
    <p>${greeting}</p>
    <p>We received a request to reset your QuoteBuilder password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p style="color:#64748b;font-size:14px;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `

  return sendEmail({ to, subject, text, html })
}
