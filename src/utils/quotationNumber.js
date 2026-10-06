export function generateQuotationNumber(existingQuotations, excludeId = null) {
  const year = new Date().getFullYear()
  const prefix = `QT-${year}-`

  const usedNumbers = existingQuotations
    .filter((quotation) => quotation.id !== excludeId)
    .map((quotation) => quotation.quotationNumber)
    .filter((number) => number?.startsWith(prefix))
    .map((number) => Number(number.replace(prefix, '')))
    .filter((number) => !Number.isNaN(number))

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1
  return `${prefix}${String(nextNumber).padStart(3, '0')}`
}

export function isQuotationNumberTaken(number, quotations, excludeId = null) {
  return quotations.some(
    (quotation) =>
      quotation.quotationNumber === number && quotation.id !== excludeId,
  )
}
