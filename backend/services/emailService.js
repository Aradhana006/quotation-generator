import nodemailer from 'nodemailer'

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  )
}

function getFromAddress() {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  const name = process.env.EMAIL_FROM_NAME || 'QuoteBuilder'
  return from ? `"${name}" <${from}>` : null
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
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
    return { sent: false, reason: 'SEND_FAILED' }
  }
}

export function isSmtpConfigured() {
  return smtpConfigured()
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
