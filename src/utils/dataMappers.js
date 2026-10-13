export function profileToQuotationSnapshot(profile = {}) {
  const bank = profile.bankDetails || {}
  const signatory = profile.signatory || {}

  return {
    company: {
      name: profile.name || '',
      logo: profile.logo || '',
      address: profile.address || '',
      phone: profile.phone || '',
      email: profile.email || '',
      website: profile.website || '',
      gstin: profile.gstin || '',
    },
    bankDetails: {
      accountName: bank.accountName || '',
      accountNumber: bank.accountNumber || '',
      bankName: bank.bankName || '',
      branch: bank.branch || '',
      ifsc: bank.ifsc || '',
    },
    signature: {
      name: signatory.name || '',
      designation: signatory.designation || 'Authorised Signatory',
      signatureImage: signatory.signature || '',
    },
  }
}

/** Fill empty quotation company/bank/signature fields from company settings. */
export function mergeCompanySnapshot(current, profile) {
  const snapshot = profileToQuotationSnapshot(profile)

  function pick(currentValue, profileValue) {
    const currentText = String(currentValue ?? '').trim()
    return currentText ? currentValue : profileValue
  }

  return {
    company: {
      name: pick(current?.company?.name, snapshot.company.name),
      logo: pick(current?.company?.logo, snapshot.company.logo),
      address: pick(current?.company?.address, snapshot.company.address),
      phone: pick(current?.company?.phone, snapshot.company.phone),
      email: pick(current?.company?.email, snapshot.company.email),
      website: pick(current?.company?.website, snapshot.company.website),
      gstin: pick(current?.company?.gstin, snapshot.company.gstin),
    },
    bankDetails: {
      accountName: pick(current?.bankDetails?.accountName, snapshot.bankDetails.accountName),
      accountNumber: pick(current?.bankDetails?.accountNumber, snapshot.bankDetails.accountNumber),
      bankName: pick(current?.bankDetails?.bankName, snapshot.bankDetails.bankName),
      branch: pick(current?.bankDetails?.branch, snapshot.bankDetails.branch),
      ifsc: pick(current?.bankDetails?.ifsc, snapshot.bankDetails.ifsc),
    },
    signature: {
      name: pick(current?.signature?.name, snapshot.signature.name),
      designation: pick(current?.signature?.designation, snapshot.signature.designation),
      signatureImage: pick(current?.signature?.signatureImage, snapshot.signature.signatureImage),
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
    referenceNumber: customer.referenceNumber || '',
    gstin: customer.gstin || '',
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
    referenceNumber: data.referenceNumber || '',
    gstin: data.gstin || '',
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

/** Raster formats that PDFKit can embed after canvas conversion. */
export const ACCEPTED_IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/gif'

export function isAcceptedImageFile(file) {
  if (!file) return false
  const type = String(file.type || '').toLowerCase()
  if (!type.startsWith('image/')) return false
  if (type.includes('svg')) return true // converted to PNG via canvas
  return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(type)
}

/**
 * Reads an image file as a PNG/JPEG data URL for reliable preview + PDF embedding.
 * Rejects PDFs and other non-image files (PDFKit cannot draw those as logos).
 */
export function readImageFile(file, onLoad, onError) {
  if (!file) {
    onLoad('')
    return
  }

  const type = String(file.type || '').toLowerCase()
  if (type.includes('pdf') || type === 'application/pdf') {
    onError?.(new Error('Please upload a PNG or JPG image — PDF files cannot be used as a logo/signature.'))
    return
  }
  if (!type.startsWith('image/')) {
    onError?.(new Error('Please upload a PNG or JPG image.'))
    return
  }

  const reader = new FileReader()
  reader.onerror = () => onError?.(new Error('Unable to read image file.'))
  reader.onload = () => {
    const rawDataUrl = reader.result
    if (typeof rawDataUrl !== 'string') {
      onError?.(new Error('Unable to read image file.'))
      return
    }

    const image = new Image()
    image.onload = () => {
      const maxEdge = 800
      let width = image.naturalWidth || image.width
      let height = image.naturalHeight || image.height

      if (!width || !height) {
        onError?.(new Error('Could not read image dimensions. Try a PNG or JPG file.'))
        return
      }

      if (width > maxEdge || height > maxEdge) {
        const scale = Math.min(maxEdge / width, maxEdge / height)
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        onError?.(new Error('Unable to process image in this browser.'))
        return
      }

      // White background so transparent PNGs/SVGs don't become black in PDF.
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)

      try {
        // JPEG is widely supported by PDFKit and keeps payloads smaller.
        onLoad(canvas.toDataURL('image/jpeg', 0.9))
      } catch {
        onError?.(new Error('Unable to convert image. Try a PNG or JPG file.'))
      }
    }
    image.onerror = () => {
      onError?.(new Error('Unable to load this image. Use a PNG or JPG file.'))
    }
    image.src = rawDataUrl
  }
  reader.readAsDataURL(file)
}
