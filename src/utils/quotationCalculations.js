export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled']

export const STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const DEFAULT_TERMS_LIBRARY = [
  'Validity: 15 Days.',
  'Payment: 100% advance along with the purchase order.',
  'Delivery: 4 to 5 weeks from the confirmed purchase order.',
  'Installation: Extra from the above quoted price.',
  'GST: 18% Extra from the above quoted price.',
]

export const TAX_RATE_OPTIONS = [0, 5, 12, 18, 28]

export const DISCOUNT_TYPES = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
}

export const EMPTY_COMPANY = {
  name: '',
  logo: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
}

export const STANDARD_COVER_LETTER_MESSAGE =
  'Thank you for the order of the products, as previously committed. Further to our discussion, please find the enclosed quotation for the agreed quantity. Kindly share the purchase order along with the advance payment as per your delivery schedule so we can initiate production. Please feel free to reach out if you require any further clarification or assistance.'

export const EMPTY_COVER_LETTER = {
  enabled: true,
  greeting: 'Dear Sir,',
  kindAttention: '',
  subject: '',
  message: STANDARD_COVER_LETTER_MESSAGE,
  closing: 'Thanking you,',
  signOffCompany: '',
  signOffTitle: 'Authorised Signatory',
}

export const EMPTY_BANK_DETAILS = {
  accountName: '',
  accountNumber: '',
  bankName: '',
  branch: '',
  ifsc: '',
}

export const EMPTY_SIGNATURE = {
  name: '',
  designation: 'Authorised Signatory',
  signatureImage: '',
}

export const EMPTY_QUOTATION_DETAILS = {
  quotationNumber: '',
  quotationDate: '',
  validityDays: 30,
  validUntil: '',
  referenceNumber: '',
  subject: '',
  currency: 'INR',
}

export const EMPTY_CUSTOMER = {
  customerId: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  referenceNumber: '',
  gstin: '',
}

export function addDaysToDateString(dateString, days) {
  if (!dateString) return ''
  const amount = Number(days)
  if (!Number.isFinite(amount)) return ''
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + amount)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createEmptyItem() {
  return {
    id: crypto.randomUUID(),
    productId: '',
    description: '',
    specification: '',
    quantity: 1,
    unit: '',
    unitPrice: 0,
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 18,
  }
}

export function isBlankItem(item) {
  return (
    !item?.productId &&
    !String(item?.description || '').trim() &&
    !String(item?.specification || '').trim() &&
    (Number(item?.unitPrice) || 0) === 0
  )
}

export function createEmptyCharge() {
  return {
    id: crypto.randomUUID(),
    name: '',
    amount: 0,
  }
}

export function getItemBaseAmount(item) {
  const quantity = Number(item.quantity) || 0
  const unitPrice = Number(item.unitPrice) || 0
  return quantity * unitPrice
}

export function getItemDiscountAmount(item) {
  const base = getItemBaseAmount(item)
  const discountValue = Number(item.discountValue) || 0
  if (item.discountType === 'fixed') {
    return Math.min(discountValue, base)
  }
  return base * (discountValue / 100)
}

export function getItemTaxableAmount(item) {
  return getItemBaseAmount(item) - getItemDiscountAmount(item)
}

export function getItemTaxAmount(item) {
  const taxable = getItemTaxableAmount(item)
  const taxRate = Number(item.taxRate) || 0
  return taxable * (taxRate / 100)
}

export function getItemFinalTotal(item) {
  return getItemTaxableAmount(item) + getItemTaxAmount(item)
}

// Backward-compatible alias used in older preview code paths.
export function getItemTotal(item) {
  return getItemFinalTotal(item)
}

export function getQuotationSummary(items, additionalCharges = []) {
  const grossAmount = items.reduce((sum, item) => sum + getItemBaseAmount(item), 0)
  const totalDiscount = items.reduce((sum, item) => sum + getItemDiscountAmount(item), 0)
  const subtotalAfterDiscount = grossAmount - totalDiscount
  const taxAmount = items.reduce((sum, item) => sum + getItemTaxAmount(item), 0)
  const additionalTotal = additionalCharges.reduce(
    (sum, charge) => sum + (Number(charge.amount) || 0),
    0,
  )
  const grandTotal = subtotalAfterDiscount + taxAmount + additionalTotal

  return {
    grossAmount,
    totalDiscount,
    subtotalAfterDiscount,
    taxAmount,
    additionalTotal,
    grandTotal,
  }
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0]
}
