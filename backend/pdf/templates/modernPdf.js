import { QuotationPdfDocument } from '../document.js'
import { renderStandardQuotation } from '../sections.js'
import { MODERN_THEME } from '../themes.js'

export async function renderModernPdf(quotation) {
  const pdf = new QuotationPdfDocument(MODERN_THEME)
  renderStandardQuotation(pdf, quotation, 'modern')
  pdf.finalize(quotation)
  return pdf.toBuffer()
}
