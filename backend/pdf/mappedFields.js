import { PAGE_HEIGHT, PAGE_WIDTH, QuotationPdfDocument } from './document.js'
import { decodeDataUrl } from './format.js'
import { isMappedFieldVisible, resolveTemplateField } from '../utils/resolveTemplateField.js'
import { DEFAULT_ITEM_TABLE_COLUMNS } from '../utils/templateFields.js'
import { MODERN_THEME } from './themes.js'

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])

function hasMappedFields(configuration) {
  return (configuration?.pages || []).some((page) => (page.fields || []).length > 0)
}

function drawImageValue(doc, value, field) {
  const buffer = decodeDataUrl(value)
  if (!buffer) return false
  try {
    doc.image(buffer, field.x, field.y, { fit: [field.width, field.height] })
    return true
  } catch {
    return false
  }
}

function drawTextField(doc, value, field) {
  const weight = field.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica'
  doc.fillColor(field.color || '#000000').font(weight).fontSize(field.fontSize || 12)
  doc.text(String(value || ''), field.x, field.y, {
    width: field.width,
    height: field.height,
    align: field.alignment || 'left',
    ellipsis: false,
  })
}

function columnValue(item, key, currency, resolve) {
  const mock = {
    items: [item],
    quotationDetails: { currency },
  }
  const fieldKey = {
    description: 'items.description',
    specification: 'items.specification',
    quantity: 'items.quantity',
    unit: 'items.unit',
    unitPrice: 'items.unitPrice',
    discount: 'items.discount',
    tax: 'items.tax',
    total: 'items.total',
  }[key]
  return fieldKey ? resolve(fieldKey, mock) : ''
}

function drawItemTable(doc, quotation, field) {
  const items = quotation.items || []
  const currency = quotation.quotationDetails?.currency || 'INR'
  const columns = field.columns?.length ? field.columns : DEFAULT_ITEM_TABLE_COLUMNS
  const totalWidth = columns.reduce((sum, column) => sum + Number(column.width || 0), 0) || field.width
  const scale = field.width / totalWidth
  const headerHeight = 16
  let x = field.x
  let y = field.y

  doc.rect(field.x, field.y, field.width, headerHeight).fill('#111827')
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(Math.max(7, (field.fontSize || 9) - 1))
  columns.forEach((column) => {
    const width = Number(column.width) * scale
    doc.text(column.label || column.key, x + 2, y + 4, { width: width - 4, align: 'left' })
    x += width
  })

  y += headerHeight
  items.forEach((item, index) => {
    if (y > field.y + field.height - 14) return
    const rowHeight = 14
    if (index % 2 === 1) {
      doc.rect(field.x, y, field.width, rowHeight).fill('#f8fafc')
    }
    x = field.x
    doc.fillColor(field.color || '#111827').font('Helvetica').fontSize(Math.max(7, (field.fontSize || 9) - 1))
    columns.forEach((column) => {
      const width = Number(column.width) * scale
      const value = columnValue(item, column.key, currency, resolveTemplateField)
      doc.text(String(value), x + 2, y + 3, { width: width - 4 })
      x += width
    })
    y += rowHeight
  })
}

export function configurationHasMappedFields(configuration) {
  return hasMappedFields(configuration)
}

export async function renderMappedCustomPdf(quotation, { customTemplate, fileBuffer, configuration } = {}) {
  const pdf = new QuotationPdfDocument({ ...MODERN_THEME, margin: 24 })
  const pages = configuration.pages || [{ page: 1, fields: [] }]
  const fileType = customTemplate?.fileType || ''

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage()

    if (index === 0 && fileBuffer && IMAGE_TYPES.has(fileType)) {
      try {
        pdf.doc.image(fileBuffer, 0, 0, {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
        })
      } catch (error) {
        console.error('Custom background image failed:', error.message)
      }
    }

    const fields = page.fields || []
    fields.forEach((field) => {
      if (!isMappedFieldVisible(field, quotation)) return

      if (field.field === 'items.table') {
        drawItemTable(pdf.doc, quotation, field)
        return
      }

      const value = resolveTemplateField(field.field, quotation)
      if (field.field === 'company.logo' || field.field === 'signature.image') {
        if (!drawImageValue(pdf.doc, value, field)) {
          drawTextField(pdf.doc, field.field === 'company.logo' ? 'Logo' : 'Signature', field)
        }
        return
      }

      drawTextField(pdf.doc, value, field)
    })
  })

  pdf.finalize(quotation)
  return pdf.toBuffer()
}
