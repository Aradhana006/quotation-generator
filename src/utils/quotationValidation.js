export function validateQuotation(formData, quotations, editingId = null) {
  const errors = {}

  if (!formData.customer?.companyName?.trim()) {
    errors.customer = 'Customer name is required.'
  }

  if (!formData.quotationDetails?.quotationNumber?.trim()) {
    errors.quotationNumber = 'Quotation number is required.'
  } else if (
    quotations.some(
      (quotation) =>
        (quotation.quotationDetails?.quotationNumber ||
          quotation.details?.quotationNumber) === formData.quotationDetails.quotationNumber &&
        quotation.id !== editingId,
    )
  ) {
    errors.quotationNumber = 'This quotation number is already in use.'
  }

  if (!formData.quotationDetails?.quotationDate) {
    errors.quotationDate = 'Quotation date is required.'
  }

  if (!formData.items?.length) {
    errors.items = 'Add at least one quotation item.'
  } else {
    formData.items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors[`item-${index}-description`] = `Item ${index + 1}: description is required.`
      }
      if (!item.quantity && item.quantity !== 0) {
        errors[`item-${index}-quantity`] = `Item ${index + 1}: quantity is required.`
      }
      if (item.unitPrice === '' || item.unitPrice === null || item.unitPrice === undefined) {
        errors[`item-${index}-unitPrice`] = `Item ${index + 1}: unit price is required.`
      }
    })
  }

  return errors
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}
