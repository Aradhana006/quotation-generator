export function formatMoney(amount, currency = 'INR') {
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe)

  if (currency === 'INR') return `Rs. ${formatted}`
  if (currency === 'USD') return `USD ${formatted}`
  if (currency === 'EUR') return `EUR ${formatted}`
  if (currency === 'GBP') return `GBP ${formatted}`
  return `${currency} ${formatted}`
}

export function formatPdfDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function sanitizePdfFilename(quotation) {
  const number = quotation.quotationDetails?.quotationNumber || 'quotation'
  const revision = Number.isFinite(Number(quotation.revisionNumber))
    ? `Rev-${quotation.revisionNumber}`
    : 'Rev-0'
  const customer = quotation.customer?.companyName || 'customer'
  const raw = `${number}-${revision}-${customer}.pdf`
  return raw.replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
}

/** True when the data URL is a raster image PDFKit can embed (PNG/JPEG). */
export function isPdfDrawableImage(value) {
  if (!value || typeof value !== 'string') return false
  return /^data:image\/(png|jpe?g)(;charset=[^;]+)?;base64,/i.test(value.trim())
}

export function decodeDataUrl(value) {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  // PDFKit only embeds PNG/JPEG reliably — reject SVG/PDF/WebP data URLs.
  const match = trimmed.match(/^data:image\/(png|jpe?g)(?:;charset=[^;]+)?;base64,([\s\S]+)$/i)
  if (!match) return null
  try {
    const base64 = match[2].replace(/\s+/g, '')
    return Buffer.from(base64, 'base64')
  } catch {
    return null
  }
}

export function hasAnyBankDetails(bank) {
  return Boolean(
    bank?.accountName ||
    bank?.accountNumber ||
    bank?.bankName ||
    bank?.branch ||
    bank?.ifsc,
  )
}
