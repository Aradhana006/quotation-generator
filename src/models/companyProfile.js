/**
 * Master data: one company profile per tenant.
 * Stored separately from quotation snapshots.
 *
 * @typedef {Object} CompanyProfile
 * @property {string} id
 * @property {string} name
 * @property {string} logo
 * @property {string} address
 * @property {string} phone
 * @property {string} email
 * @property {string} website
 * @property {string} gstin
 * @property {Object} bankDetails
 * @property {Object} signatory
 */

export const COMPANY_PROFILE_SHAPE = {
  id: '',
  name: '',
  logo: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
  bankDetails: {
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    ifsc: '',
  },
  signatory: {
    name: '',
    designation: 'Authorised Signatory',
    signature: '',
  },
}

/** Current frontend default (no id yet — will be assigned by backend) */
export const EMPTY_COMPANY_PROFILE = { ...COMPANY_PROFILE_SHAPE }
