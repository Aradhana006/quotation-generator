/**
 * Honeypot checks for public auth forms.
 * Real users leave these invisible fields empty; bots often fill them.
 */

export function isHoneypotTriggered(body = {}) {
  const website = String(body.website ?? '').trim()
  const fax = String(body.fax ?? '').trim()
  return Boolean(website || fax)
}
