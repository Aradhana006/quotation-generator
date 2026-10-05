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

export function decodeDataUrl(value) {
  if (!value || typeof value !== 'string') return null
  const match = value.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/)
  if (!match) return null
  try {
    return Buffer.from(match[1], 'base64')
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
