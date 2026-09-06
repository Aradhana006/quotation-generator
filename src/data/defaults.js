export const EMPTY_COMPANY_PROFILE = {
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

export const EMPTY_SAVED_CUSTOMER = {
  id: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

export const EMPTY_PRODUCT = {
  id: '',
  name: '',
  description: '',
  unit: '',
  defaultPrice: 0,
  defaultTax: 18,
}

export const STORAGE_KEYS = {
  companyProfile: 'quotation-generator-company-profile',
  customers: 'quotation-generator-customers',
  products: 'quotation-generator-products',
  quotations: 'quotation-generator-quotations',
  defaultTermsLibrary: 'quotation-generator-default-terms',
  customTemplates: 'quotation-generator-custom-templates',
}
