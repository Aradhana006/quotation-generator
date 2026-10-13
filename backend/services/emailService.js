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

function resendApiKey() {
  return env('RESEND_API_KEY')
}

function smtpConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && smtpPassword())
}

function emailConfigured() {
  return Boolean(resendApiKey() || smtpConfigured())
}

function getFromAddress() {
  const from = env('EMAIL_FROM') || env('SMTP_USER') || 'beth.t@example.com'
  const name = env('EMAIL_FROM_NAME') || 'QuoteBuilder'
  return { email: from, name, formatted: `"${name}" <${from}>` }
}

function createTransport({ port, secure }) {
  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: env('SMTP_USER'),
      pass: smtpPassword(),
    },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 12_000,
  })
}

async function sendViaResend({ to, subject, text, html }) {
  const apiKey = resendApiKey()
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_NOT_CONFIGURED' }
  }

  const from = getFromAddress()
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${from.name} <${from.email}>`,
        to: [to],
        subject,
        text,
        html,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('Resend send failed:', response.status, body)
      return {
        sent: false,
        reason: 'SEND_FAILED',
        detail: `Resend ${response.status}: ${body.slice(0, 180)}`,
      }
    }

    return { sent: true, provider: 'resend' }
  } catch (error) {
    console.error('Resend send failed:', error.message)
    return {
      sent: false,
      reason: 'SEND_FAILED',
      detail: String(error.message || 'unknown').slice(0, 220),
    }
  }
}

async function sendViaSmtp({ to, subject, text, html }) {
  if (!smtpConfigured()) {
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }
  }

  const from = getFromAddress()
  const attempts = [
    {
      port: Number(env('SMTP_PORT') || 587),
      secure: String(env('SMTP_SECURE') || '').toLowerCase() === 'true',
    },
    // Render often times out on Gmail:587 — try SMTPS as fallback.
    { port: 465, secure: true },
  ]

  const seen = new Set()
  let lastDetail = 'unknown'

  for (const attempt of attempts) {
    const key = `${attempt.port}:${attempt.secure}`
    if (seen.has(key)) continue
    seen.add(key)

    try {
      const transport = createTransport(attempt)
      await transport.sendMail({
        from: from.formatted,
        to,
        subject,
        text,
        html,
      })
      return { sent: true, provider: `smtp:${attempt.port}` }
    } catch (error) {
      lastDetail = String(error.message || 'unknown').slice(0, 220)
      console.error(`SMTP ${attempt.port} send failed:`, error.message)
    }
  }

  return { sent: false, reason: 'SEND_FAILED', detail: lastDetail }
}

/**
 * Attempt to send email. Returns { sent: boolean, reason?: string }.
 * Prefer Resend (HTTPS) on Render — Gmail SMTP often times out there.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!emailConfigured()) {
    return { sent: false, reason: 'EMAIL_NOT_CONFIGURED' }
  }

  if (resendApiKey()) {
    const resendResult = await sendViaResend({ to, subject, text, html })
    if (resendResult.sent) return resendResult
    // Fall through to SMTP if Resend fails and SMTP exists.
    if (!smtpConfigured()) return resendResult
  }

  return sendViaSmtp({ to, subject, text, html })
}

export function isSmtpConfigured() {
  return emailConfigured()
}

/** Used by /api/health/email so Render email misconfig is visible. */
export async function verifySmtp() {
  if (resendApiKey()) {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${resendApiKey()}` },
      })
      if (response.ok || response.status === 403 || response.status === 401) {
        // 200 = key works. 401/403 = key rejected (still proves HTTPS path works).
        if (response.status === 401) {
          return {
            ok: false,
            reason: 'RESEND_UNAUTHORIZED',
            detail: 'RESEND_API_KEY was rejected by Resend.',
          }
        }
        return { ok: true, provider: 'resend' }
      }
      return {
        ok: false,
        reason: 'RESEND_VERIFY_FAILED',
        detail: `Resend HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        ok: false,
        reason: 'RESEND_VERIFY_FAILED',
        detail: String(error.message || 'unknown').slice(0, 220),
      }
    }
  }

  if (!smtpConfigured()) {
    return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' }
  }

  const attempts = [
    {
      port: Number(env('SMTP_PORT') || 587),
      secure: String(env('SMTP_SECURE') || '').toLowerCase() === 'true',
    },
    { port: 465, secure: true },
  ]
  const seen = new Set()
  let lastDetail = 'unknown'

  for (const attempt of attempts) {
    const key = `${attempt.port}:${attempt.secure}`
    if (seen.has(key)) continue
    seen.add(key)
    try {
      await createTransport(attempt).verify()
      return { ok: true, provider: `smtp:${attempt.port}` }
    } catch (error) {
      lastDetail = String(error.message || 'unknown').slice(0, 220)
      console.error(`SMTP ${attempt.port} verify failed:`, error.message)
    }
  }

  return {
    ok: false,
    reason: 'SMTP_VERIFY_FAILED',
    detail: lastDetail,
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
