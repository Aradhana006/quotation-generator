import { QuotationPdfDocument } from '../document.js'
import { renderStandardQuotation } from '../sections.js'
import { CLASSIC_THEME } from '../themes.js'

export async function renderClassicPdf(quotation) {
  const pdf = new QuotationPdfDocument(CLASSIC_THEME)
  renderStandardQuotation(pdf, quotation, 'classic')
  pdf.finalize(quotation)
  return pdf.toBuffer()
}
