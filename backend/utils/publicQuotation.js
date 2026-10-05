export function isQuotationPastValidUntil(quotation) {
  const validUntil = quotation?.quotationDetails?.validUntil
  if (!validUntil) return false
  const end = new Date(validUntil)
  if (Number.isNaN(end.getTime())) return false
  end.setHours(23, 59, 59, 999)
  return end.getTime() < Date.now()
}

export function isQuotationExpiredForCustomer(quotation) {
  return quotation?.status === 'expired' || isQuotationPastValidUntil(quotation)
}

export function buildPublicPermissions(quotation) {
  const expired = isQuotationExpiredForCustomer(quotation)
  const canAct =
    quotation?.status === 'sent' &&
    !expired &&
    !quotation?.archivedAt

  return {
    canAccept: canAct,
    canReject: canAct,
    canRequestChanges: canAct,
  }
}

export function getPublicLockMessage(quotation, permissions) {
  if (quotation?.status === 'accepted') {
    return 'This quotation has already been accepted.'
  }
  if (quotation?.status === 'rejected') {
    return 'This quotation has already been rejected.'
  }
  if (quotation?.status === 'cancelled') {
    return 'This quotation is no longer available for response.'
  }
  if (quotation?.status === 'draft') {
    return 'This quotation is not yet open for a customer response.'
  }
  if (isQuotationExpiredForCustomer(quotation)) {
    return 'This quotation has expired.'
  }
  if (!permissions.canAccept && !permissions.canReject && !permissions.canRequestChanges) {
    return 'This quotation is not available for a response.'
  }
  return null
}

export function toPublicQuotation(quotation, customTemplate = null) {
  return {
    quotationNumber: quotation.quotationDetails?.quotationNumber || '',
    revision: quotation.revisionNumber ?? 0,
    status: quotation.status,
    date: quotation.quotationDetails?.quotationDate || '',
    validUntil: quotation.quotationDetails?.validUntil || '',
    expired: isQuotationExpiredForCustomer(quotation),
    company: {
      name: quotation.company?.name || '',
      logo: quotation.company?.logo || '',
      address: quotation.company?.address || '',
      phone: quotation.company?.phone || '',
      email: quotation.company?.email || '',
      website: quotation.company?.website || '',
      gstin: quotation.company?.gstin || '',
    },
    customer: {
      companyName: quotation.customer?.companyName || '',
      contactPerson: quotation.customer?.contactPerson || '',
      email: quotation.customer?.email || '',
      phone: quotation.customer?.phone || '',
      address: quotation.customer?.address || '',
    },
    items: (quotation.items || []).map((item) => ({
      description: item.description || '',
      specification: item.specification || '',
      quantity: item.quantity,
      unit: item.unit || '',
      unitPrice: item.unitPrice,
      discountType: item.discountType,
      discountValue: item.discountValue,
      taxRate: item.taxRate,
      lineTotal: item.lineTotal,
    })),
    additionalCharges: (quotation.additionalCharges || []).map((charge) => ({
      name: charge.name,
      amount: charge.amount,
    })),
    totals: {
      subtotal: quotation.summary?.subtotal,
      totalDiscount: quotation.summary?.totalDiscount,
      taxAmount: quotation.summary?.taxAmount,
      additionalTotal: quotation.summary?.additionalTotal,
      grandTotal: quotation.summary?.grandTotal,
    },
    terms: quotation.terms || [],
    notes: quotation.notes || '',
    paymentTerms: quotation.paymentTerms || '',
    deliveryTerms: quotation.deliveryTerms || '',
    bankDetails: quotation.bankDetails || {},
    signature: quotation.signature || {},
    coverLetter: quotation.coverLetter || { enabled: false },
    quotationDetails: quotation.quotationDetails || {},
    selectedTemplate: quotation.selectedTemplate || { type: 'builtin', id: 'modern' },
    customTemplate: customTemplate
      ? {
          name: customTemplate.name,
          configuration: customTemplate.configuration || {},
          previewUrl: customTemplate.previewUrl || null,
          fileType: customTemplate.fileType || '',
        }
      : null,
  }
}
