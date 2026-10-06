const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  if (typeof value !== 'string') return false
  const email = value.trim()
  if (!email || email.length > 254) return false
  return EMAIL_PATTERN.test(email)
}

export function validateSendPayload(body = {}) {
  const recipientEmail = String(body.recipientEmail || '').trim()
  const recipientName = String(body.recipientName || '').trim()
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()

  if (!recipientEmail) {
    return { error: 'Recipient email is required.' }
  }
  if (!isValidEmail(recipientEmail)) {
    return { error: 'Recipient email format is invalid.' }
  }
  if (recipientName.length > 200) {
    return { error: 'Recipient name is too long.' }
  }
  if (!subject) {
    return { error: 'Subject is required.' }
  }
  if (subject.length > 200) {
    return { error: 'Subject is too long.' }
  }
  if (!message) {
    return { error: 'Message is required.' }
  }
  if (message.length > 5000) {
    return { error: 'Message is too long.' }
  }

  return {
    value: {
      recipientEmail,
      recipientName,
      subject,
      message,
    },
  }
}
