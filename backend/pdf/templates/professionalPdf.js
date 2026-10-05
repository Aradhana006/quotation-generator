import { QuotationPdfDocument } from '../document.js'
import { renderStandardQuotation } from '../sections.js'
import { PROFESSIONAL_THEME } from '../themes.js'

export async function renderProfessionalPdf(quotation) {
  const pdf = new QuotationPdfDocument(PROFESSIONAL_THEME)
  renderStandardQuotation(pdf, quotation, 'professional')
  pdf.finalize(quotation)
  return pdf.toBuffer()
}
