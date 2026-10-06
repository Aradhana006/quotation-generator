/**
 * Transaction data: a complete quotation document.
 *
 * NOTE: Frontend currently uses `quotationDetails` for the `details` block.
 * API/database will use `details`. Services map between them.
 *
 * @typedef {Object} QuotationDetails
 * @property {string} quotationNumber
 * @property {string} quotationDate
 * @property {string} validUntil
 * @property {string} referenceNumber
 * @property {string} subject
 * @property {string} currency
 */

/**
 * @typedef {Object} QuotationItem
 * @property {string} id
 * @property {string} [productId] - reference to master product (optional)
 * @property {string} description
 * @property {string} specification
 * @property {number} quantity
 * @property {string} unit
 * @property {number} unitPrice
 * @property {'percentage'|'fixed'} discountType
 * @property {number} discountValue
 * @property {number} taxRate
 */

/**
 * @typedef {Object} AdditionalCharge
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 */

/**
 * @typedef {Object} Quotation
 * @property {string} id
 * @property {string} quotationNumber - denormalized for list queries (also inside details)
 * @property {'draft'|'sent'|'accepted'|'rejected'|'expired'} status
 * @property {string} [customerId] - optional reference to master customer
 * @property {Object} company - snapshot
 * @property {Object} customer - snapshot
 * @property {QuotationDetails} details
 * @property {Object} coverLetter
 * @property {QuotationItem[]} items
 * @property {AdditionalCharge[]} additionalCharges
 * @property {string} notes
 * @property {string} paymentTerms
 * @property {string} deliveryTerms
 * @property {string[]} terms - copied term texts (not live references)
 * @property {Object} bankDetails - snapshot
 * @property {Object} signature - snapshot
 * @property {Object} selectedTemplate - template selection snapshot
 * @property {string} companyId - tenant isolation (future)
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired']

export const QUOTATION_ITEM_SHAPE = {
  id: '',
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

export const ADDITIONAL_CHARGE_SHAPE = {
  id: '',
  name: '',
  amount: 0,
}

export const QUOTATION_SHAPE = {
  id: '',
  quotationNumber: '',
  status: 'draft',
  customerId: '',
  company: {},
  customer: {},
  details: {},
  coverLetter: {},
  items: [],
  additionalCharges: [],
  notes: '',
  paymentTerms: '',
  deliveryTerms: '',
  terms: [],
  bankDetails: {},
  signature: {},
  selectedTemplate: { type: 'builtin', id: 'modern' },
  companyId: '',
  createdAt: '',
  updatedAt: '',
}
