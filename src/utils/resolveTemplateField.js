import { formatCurrency, formatDate } from './quotationCalculations'

function firstItem(quotation) {
  return quotation.items?.[0] || {}
}

function formatBankDetails(bank = {}) {
  return [
    bank.accountName ? `Account Name: ${bank.accountName}` : '',
    bank.accountNumber ? `Account Number: ${bank.accountNumber}` : '',
    bank.bankName ? `Bank Name: ${bank.bankName}` : '',
    bank.branch ? `Branch: ${bank.branch}` : '',
    bank.ifsc ? `IFSC: ${bank.ifsc}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function formatCharges(quotation) {
  const charges = quotation.additionalCharges || []
  if (!charges.length) return ''
  const currency = quotation.quotationDetails?.currency || 'INR'
  return charges
    .map((charge) => `${charge.name || 'Charge'}: ${formatCurrency(charge.amount, currency)}`)
    .join('\n')
}

function formatTerms(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return ''
  return terms.map((term, index) => `${index + 1}. ${term}`).join('\n')
}

function itemDiscountLabel(item, currency) {
  if (item.discountType === 'fixed') {
    return formatCurrency(item.discountValue || item.discountAmount || 0, currency)
  }
  return `${Number(item.discountValue) || 0}%`
}

const GETTERS = {
  'company.name': (quotation) => quotation.company?.name || '',
  'company.logo': (quotation) => quotation.company?.logo || '',
  'company.address': (quotation) => quotation.company?.address || '',
  'company.phone': (quotation) => quotation.company?.phone || '',
  'company.email': (quotation) => quotation.company?.email || '',
  'company.website': (quotation) => quotation.company?.website || '',
  'company.gstin': (quotation) => quotation.company?.gstin || '',
  'quotation.quotationNumber': (quotation) => quotation.quotationDetails?.quotationNumber || '',
  'quotation.date': (quotation) => formatDate(quotation.quotationDetails?.quotationDate),
  'quotation.validUntil': (quotation) => formatDate(quotation.quotationDetails?.validUntil),
  'quotation.referenceNumber': (quotation) => quotation.quotationDetails?.referenceNumber || '',
  'quotation.subject': (quotation) => quotation.quotationDetails?.subject || '',
  'customer.companyName': (quotation) => quotation.customer?.companyName || '',
  'customer.contactPerson': (quotation) => quotation.customer?.contactPerson || '',
  'customer.email': (quotation) => quotation.customer?.email || '',
  'customer.phone': (quotation) => quotation.customer?.phone || '',
  'customer.address': (quotation) => quotation.customer?.address || '',
  'coverLetter.greeting': (quotation) => quotation.coverLetter?.greeting || '',
  'coverLetter.kindAttention': (quotation) => quotation.coverLetter?.kindAttention || '',
  'coverLetter.subject': (quotation) => quotation.coverLetter?.subject || '',
  'coverLetter.message': (quotation) => quotation.coverLetter?.message || '',
  'coverLetter.closing': (quotation) => quotation.coverLetter?.closing || '',
  'items.description': (quotation) => firstItem(quotation).description || '',
  'items.specification': (quotation) => firstItem(quotation).specification || '',
  'items.quantity': (quotation) => String(firstItem(quotation).quantity ?? ''),
  'items.unit': (quotation) => firstItem(quotation).unit || '',
  'items.unitPrice': (quotation) =>
    formatCurrency(firstItem(quotation).unitPrice || 0, quotation.quotationDetails?.currency || 'INR'),
  'items.discount': (quotation) =>
    itemDiscountLabel(firstItem(quotation), quotation.quotationDetails?.currency || 'INR'),
  'items.tax': (quotation) => `${Number(firstItem(quotation).taxRate) || 0}%`,
  'items.total': (quotation) =>
    formatCurrency(firstItem(quotation).lineTotal || 0, quotation.quotationDetails?.currency || 'INR'),
  'pricing.subtotal': (quotation) =>
    formatCurrency(quotation.summary?.subtotal || 0, quotation.quotationDetails?.currency || 'INR'),
  'pricing.totalDiscount': (quotation) =>
    formatCurrency(quotation.summary?.totalDiscount || 0, quotation.quotationDetails?.currency || 'INR'),
  'pricing.taxableAmount': (quotation) =>
    formatCurrency(
      quotation.summary?.taxableAmount ?? quotation.summary?.subtotalAfterDiscount ?? 0,
      quotation.quotationDetails?.currency || 'INR',
    ),
  'pricing.tax': (quotation) =>
    formatCurrency(quotation.summary?.taxAmount || 0, quotation.quotationDetails?.currency || 'INR'),
  'pricing.additionalCharges': (quotation) => formatCharges(quotation),
  'pricing.grandTotal': (quotation) =>
    formatCurrency(quotation.summary?.grandTotal || 0, quotation.quotationDetails?.currency || 'INR'),
  notes: (quotation) => quotation.notes || '',
  paymentTerms: (quotation) => quotation.paymentTerms || '',
  deliveryTerms: (quotation) => quotation.deliveryTerms || '',
  terms: (quotation) => formatTerms(quotation.terms),
  bankDetails: (quotation) => formatBankDetails(quotation.bankDetails),
  'signature.name': (quotation) => quotation.signature?.name || '',
  'signature.designation': (quotation) => quotation.signature?.designation || '',
  'signature.image': (quotation) => quotation.signature?.signatureImage || '',
}

export function resolveTemplateField(field, quotation) {
  const getter = GETTERS[field]
  if (!getter) return ''
  return getter(quotation) ?? ''
}

export function isMappedFieldVisible(mappedField, quotation) {
  if (!mappedField || mappedField.visibility === 'always') return true

  const key = mappedField.field
  if (key.startsWith('coverLetter.')) return Boolean(quotation.coverLetter?.enabled)
  if (key === 'company.gstin' || key === 'pricing.tax' || key === 'items.tax') {
    return Number(quotation.summary?.taxAmount) > 0
  }
  if (key === 'pricing.additionalCharges') {
    return (quotation.additionalCharges || []).length > 0
  }
  if (key.startsWith('signature.')) {
    return Boolean(
      quotation.signature?.name ||
        quotation.signature?.signatureImage ||
        quotation.signature?.designation,
    )
  }
  if (key === 'bankDetails') {
    const bank = quotation.bankDetails || {}
    return Boolean(bank.accountName || bank.accountNumber || bank.bankName || bank.ifsc)
  }
  if (key === 'terms') return (quotation.terms || []).length > 0
  if (key === 'notes') return Boolean(quotation.notes?.trim())
  return true
}

export function configurationHasMappedFields(configuration) {
  return (configuration?.pages || []).some((page) => (page.fields || []).length > 0)
}
