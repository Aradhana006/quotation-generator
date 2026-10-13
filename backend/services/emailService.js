import nodemailer from 'nodemailer'

/** Fixed Resend test sender — never take From from env (avoids example.com / gmail mistakes). */
const RESEND_FROM = 'QuoteBuilder <beth.t@example.com>'
const EMAIL_BUILD = 'resend-from-v4'

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

function getSmtpFromAddress() {
  const from = env('EMAIL_FROM') || env('SMTP_USER') || 'beth.t@example.com'
  const name = env('EMAIL_FROM_NAME') || 'QuoteBuilder'
  return `"${name}" <${from}>`
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

  if (!apiKey.startsWith('re_')) {
    return {
      sent: false,
      reason: 'SEND_FAILED',
      detail:
        'RESEND_API_KEY looks invalid. Paste the full key from Resend → API Keys (starts with re_).',
    }
  }

  try {
    const payload = {
      from: RESEND_FROM,
      to: [to],
      subject,
      text,
      html,
    }
    console.log(`[email] Resend send using from=${RESEND_FROM} build=${EMAIL_BUILD}`)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

  const from = getSmtpFromAddress()
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
      const transport = createTransport(attempt)
      await transport.sendMail({
        from,
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
 * Prefer Resend (HTTPS) on Render — Gmail SMTP often times out there.
 * Do not fall back to SMTP after a Resend API error (avoids long timeouts).
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!emailConfigured()) {
    return { sent: false, reason: 'EMAIL_NOT_CONFIGURED' }
  }

  if (resendApiKey()) {
    return sendViaResend({ to, subject, text, html })
  }

  return sendViaSmtp({ to, subject, text, html })
}

export function isSmtpConfigured() {
  return emailConfigured()
}

export function getEmailDebugInfo() {
  const key = resendApiKey()
  return {
    build: EMAIL_BUILD,
    provider: key ? 'resend' : smtpConfigured() ? 'smtp' : 'none',
    resendFrom: RESEND_FROM,
    hasResendKey: Boolean(key),
    resendKeyPrefix: key ? `${key.slice(0, 5)}…` : null,
  }
}

/** Used by /api/health/email so Render email misconfig is visible. */
export async function verifySmtp() {
  const debug = getEmailDebugInfo()

  if (resendApiKey()) {
    if (!resendApiKey().startsWith('re_')) {
      return {
        ok: false,
        reason: 'RESEND_UNAUTHORIZED',
        detail: 'RESEND_API_KEY must start with re_. Create a new key at resend.com/api-keys.',
        debug,
      }
    }

    // Validate key with a lightweight authenticated call.
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${resendApiKey()}` },
      })
      if (response.status === 401) {
        return {
          ok: false,
          reason: 'RESEND_UNAUTHORIZED',
          detail:
            'RESEND_API_KEY was rejected. Create a new key at resend.com/api-keys and paste only the key value on Render.',
          debug,
        }
      }
      // 200 or 403 (no domain permission) still means the key is accepted.
      return { ok: true, provider: 'resend', debug }
    } catch (error) {
      return {
        ok: false,
        reason: 'RESEND_VERIFY_FAILED',
        detail: String(error.message || 'unknown').slice(0, 220),
        debug,
      }
    }
  }

  if (!smtpConfigured()) {
    return { ok: false, reason: 'EMAIL_NOT_CONFIGURED', debug }
  }

  try {
    await createTransport({
      port: Number(env('SMTP_PORT') || 587),
      secure: String(env('SMTP_SECURE') || '').toLowerCase() === 'true',
    }).verify()
    return { ok: true, provider: 'smtp', debug }
  } catch (error) {
    return {
      ok: false,
      reason: 'SMTP_VERIFY_FAILED',
      detail: String(error.message || 'unknown').slice(0, 220),
      debug,
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
