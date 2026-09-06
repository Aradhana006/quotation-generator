export const EMPTY_COMPANY = {
  name: '',
  logo: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
}

export const EMPTY_COVER_LETTER = {
  enabled: false,
  greeting: 'Dear Sir,',
  kindAttention: '',
  subject: '',
  message: 'Thank you for your enquiry. Please find our quotation for the requested requirements.',
  closing: 'Thanking you,',
  signOffCompany: '',
  signOffTitle: 'Authorised Signatory',
}

export const DEFAULT_TERMS = [
  'Validity: 15 Days.',
  'Payment: 100% advance along with purchase order.',
  'Delivery: 4 to 5 weeks from confirmed purchase order.',
  'Installation: Extra.',
  'GST: 18% extra.',
]

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
  validUntil: '',
  referenceNumber: '',
  subject: '',
}

export const EMPTY_CUSTOMER = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

export function createEmptyItem() {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  }
}

export function getItemTotal(item) {
  const quantity = Number(item.quantity) || 0
  const unitPrice = Number(item.unitPrice) || 0
  return quantity * unitPrice
}

export function getSubtotal(items) {
  return items.reduce((sum, item) => sum + getItemTotal(item), 0)
}

export function getGstAmount(subtotal, gstPercent) {
  const rate = Number(gstPercent) || 0
  return subtotal * (rate / 100)
}

export function getGrandTotal(subtotal, gstAmount) {
  return subtotal + gstAmount
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}
