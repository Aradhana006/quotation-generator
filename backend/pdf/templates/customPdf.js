import { configurationHasMappedFields, renderMappedCustomPdf } from '../mappedFields.js'
import { QuotationPdfDocument } from '../document.js'
import { renderStandardQuotation } from '../sections.js'
import { MODERN_THEME } from '../themes.js'

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])

function drawCustomNotice(pdf, customTemplate) {
  pdf.ensureSpace(90)
  pdf.doc.rect(pdf.left, pdf.y, pdf.width, 72).fill('#fffbeb')
  pdf.font('heading').size(11).fill('#92400e')
  pdf.doc.text('Custom template — reference only', pdf.left + 12, pdf.y + 10, {
    width: pdf.width - 24,
  })
  pdf.font('body').size(9).fill('#78350f')
  const fileLabel = customTemplate?.fileName
    ? `Uploaded file: ${customTemplate.fileName}`
    : 'The selected custom template file could not be loaded.'
  pdf.doc.text(
    `${fileLabel}\nNo field mapping has been saved yet. Open Edit Layout to place quotation fields on this format. Until then, quotation data is rendered on the following pages using the standard layout.`,
    pdf.left + 12,
    pdf.y + 26,
    { width: pdf.width - 24 },
  )
  pdf.y += 86
}

export async function renderCustomPdf(quotation, { customTemplate, fileBuffer } = {}) {
  const configuration = customTemplate?.configuration
  if (configurationHasMappedFields(configuration)) {
    return renderMappedCustomPdf(quotation, { customTemplate, fileBuffer, configuration })
  }

  const pdf = new QuotationPdfDocument(MODERN_THEME)
  const fileType = customTemplate?.fileType || ''

  drawCustomNotice(pdf, customTemplate)

  if (fileBuffer && IMAGE_TYPES.has(fileType)) {
    pdf.ensureSpace(220)
    try {
      pdf.doc.image(fileBuffer, pdf.left, pdf.y, {
        fit: [pdf.width, 360],
        align: 'center',
      })
      pdf.y += 370
    } catch (error) {
      console.error('Custom template image could not be drawn:', error.message)
      pdf.font('body').size(9).fill(pdf.theme.colors.muted)
      pdf.wrappedText('The uploaded image could not be placed on this page.')
    }
  } else if (fileType === 'application/pdf') {
    pdf.font('body').size(9).fill(pdf.theme.colors.muted)
    pdf.wrappedText(
      'Uploaded PDF backgrounds are stored for a future field-mapping editor. They are not overlaid automatically.',
    )
  } else if (fileType.includes('wordprocessingml') || fileType.includes('docx')) {
    pdf.font('body').size(9).fill(pdf.theme.colors.muted)
    pdf.wrappedText(
      'Uploaded Word documents are stored as a format reference. Automatic field placement is not available yet.',
    )
  }

  pdf.addPage()
  renderStandardQuotation(pdf, quotation, 'modern')
  pdf.finalize(quotation)
  return pdf.toBuffer()
}
