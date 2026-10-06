/**
 * Master data: reusable customer records.
 *
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} companyName
 * @property {string} contactPerson
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 */

export const CUSTOMER_SHAPE = {
  id: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

export const EMPTY_SAVED_CUSTOMER = { ...CUSTOMER_SHAPE }

/**
 * Customer data embedded inside a quotation (snapshot).
 * Includes customerId for reference + copied fields for historical accuracy.
 *
 * @typedef {Object} QuotationCustomerSnapshot
 * @property {string} [customerId] - reference to master record (optional if typed manually)
 * @property {string} companyName
 * @property {string} contactPerson
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 */

export const EMPTY_CUSTOMER = {
  customerId: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}
