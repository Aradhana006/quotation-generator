export function profileToQuotationSnapshot(profile) {
  return {
    company: {
      name: profile.name,
      logo: profile.logo,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      gstin: profile.gstin,
    },
    bankDetails: {
      accountName: profile.bankDetails.accountName,
      accountNumber: profile.bankDetails.accountNumber,
      bankName: profile.bankDetails.bankName,
      branch: profile.bankDetails.branch,
      ifsc: profile.bankDetails.ifsc,
    },
    signature: {
      name: profile.signatory.name,
      designation: profile.signatory.designation,
      signatureImage: profile.signatory.signature,
    },
  }
}

export function copyCustomerToQuotation(customer) {
  return {
    customerId: customer.id || '',
    companyName: customer.companyName,
    contactPerson: customer.contactPerson,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  }
}

/**
 * Copies product master data into a new quotation line item (snapshot).
 * Values are copied once — later product price changes do NOT affect this item.
 */
export function copyProductToQuotationItem(product) {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    description: product.description?.trim() || product.name,
    specification: '',
    quantity: 1,
    unit: product.unit,
    unitPrice: product.defaultPrice,
    discountType: 'percentage',
    discountValue: 0,
    taxRate: product.defaultTax,
  }
}

export function buildQuotationPayload({
  id,
  status,
  company,
  customer,
  quotationDetails,
  coverLetter,
  items,
  additionalCharges,
  notes,
  paymentTerms,
  deliveryTerms,
  terms,
  bankDetails,
  signature,
  selectedTemplate,
  createdAt,
}) {
  return {
    id: id || crypto.randomUUID(),
    status: status || 'draft',
    company,
    customer,
    quotationDetails,
    coverLetter,
    items,
    additionalCharges,
    notes,
    paymentTerms,
    deliveryTerms,
    terms,
    bankDetails,
    signature,
    selectedTemplate,
    createdAt,
    updatedAt: new Date().toISOString(),
  }
}

export function createSavedCustomer(data) {
  return {
    id: crypto.randomUUID(),
    companyName: data.companyName,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    address: data.address,
  }
}

export function createProduct(data) {
  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    unit: data.unit,
    defaultPrice: Number(data.defaultPrice) || 0,
    defaultTax: Number(data.defaultTax) || 0,
  }
}

export function readImageFile(file, onLoad) {
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
  reader.readAsDataURL(file)
}
