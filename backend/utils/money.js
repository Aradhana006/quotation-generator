/**
 * Money is stored as PostgreSQL NUMERIC(14,2).
 * Node calculates in integer paise/cents to avoid IEEE-754 rounding errors.
 */

export function toCents(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * 100)
}

export function fromCents(cents) {
  return Number((cents / 100).toFixed(2))
}

export function calculateLine(item) {
  const quantity = Number(item.quantity)
  const unitPriceCents = toCents(item.unitPrice)
  const baseCents = Math.round(quantity * unitPriceCents)

  const discountType = item.discountType === 'fixed' ? 'fixed' : 'percentage'
  const discountValue = Number(item.discountValue) || 0
  const discountCents =
    discountType === 'fixed'
      ? Math.min(toCents(discountValue), baseCents)
      : Math.round(baseCents * (discountValue / 100))

  const lineSubtotalCents = baseCents - discountCents
  const taxRate = Number(item.taxRate) || 0
  const taxCents = Math.round(lineSubtotalCents * (taxRate / 100))
  const lineTotalCents = lineSubtotalCents + taxCents

  return {
    quantity,
    unitPrice: fromCents(unitPriceCents),
    discountType,
    discountValue,
    discountAmount: fromCents(discountCents),
    taxRate,
    taxAmount: fromCents(taxCents),
    lineSubtotal: fromCents(lineSubtotalCents),
    lineTotal: fromCents(lineTotalCents),
    _cents: {
      discount: discountCents,
      lineSubtotal: lineSubtotalCents,
      tax: taxCents,
      lineTotal: lineTotalCents,
    },
  }
}

export function calculateQuotationTotals(items, charges = []) {
  const calculatedItems = items.map((item) => ({
    ...item,
    ...calculateLine(item),
  }))

  const totalDiscountCents = calculatedItems.reduce((sum, item) => sum + item._cents.discount, 0)
  const taxableCents = calculatedItems.reduce((sum, item) => sum + item._cents.lineSubtotal, 0)
  const totalTaxCents = calculatedItems.reduce((sum, item) => sum + item._cents.tax, 0)
  const chargesCents = charges.reduce((sum, charge) => sum + toCents(charge.amount), 0)

  calculatedItems.forEach((item) => {
    delete item._cents
  })

  return {
    items: calculatedItems,
    totals: {
      subtotal: fromCents(taxableCents),
      totalDiscount: fromCents(totalDiscountCents),
      taxableAmount: fromCents(taxableCents),
      totalTax: fromCents(totalTaxCents),
      additionalChargesTotal: fromCents(chargesCents),
      grandTotal: fromCents(taxableCents + totalTaxCents + chargesCents),
    },
  }
}
