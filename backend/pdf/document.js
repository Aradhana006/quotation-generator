import PDFDocument from 'pdfkit'
import { decodeDataUrl } from './format.js'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

export class QuotationPdfDocument {
  constructor(theme) {
    this.theme = theme
    this.margin = theme.margin || 48
    this.footerHeight = 36
    this.doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margin: 0,
      info: {
        Title: 'Quotation',
        Creator: 'Quotation Generator',
      },
    })
    this.y = this.margin
    this.contentBottom = PAGE_HEIGHT - this.margin - this.footerHeight
  }

  get width() {
    return PAGE_WIDTH - this.margin * 2
  }

  get left() {
    return this.margin
  }

  get right() {
    return PAGE_WIDTH - this.margin
  }

  remaining() {
    return this.contentBottom - this.y
  }

  addPage() {
    this.doc.addPage()
    this.y = this.margin
  }

  ensureSpace(height) {
    if (this.y + height > this.contentBottom) {
      this.addPage()
    }
  }

  font(name = 'body') {
    const mapped = this.theme.fonts[name] || this.theme.fonts.body
    this.doc.font(mapped)
    return this
  }

  size(value) {
    this.doc.fontSize(value)
    return this
  }

  fill(color) {
    this.doc.fillColor(color || this.theme.colors.text)
    return this
  }

  move(amount) {
    this.y += amount
    return this
  }

  textHeight(text, options = {}) {
    return this.doc.heightOfString(String(text || ''), {
      width: options.width || this.width,
      align: options.align || 'left',
      lineGap: options.lineGap || 2,
    })
  }

  text(value, x, y, options = {}) {
    this.doc.text(String(value || ''), x, y, options)
    return this
  }

  wrappedText(value, options = {}) {
    const text = String(value || '')
    if (!text.trim()) return 0
    const width = options.width || this.width
    const height = this.textHeight(text, { width, lineGap: options.lineGap })
    this.ensureSpace(height + (options.paddingBottom || 6))
    this.doc.text(text, options.x || this.left, this.y, {
      width,
      align: options.align || 'left',
      lineGap: options.lineGap || 2,
    })
    this.y += height + (options.paddingBottom ?? 8)
    return height
  }

  hline(color = this.theme.colors.line, thickness = 0.6) {
    this.ensureSpace(10)
    this.doc
      .strokeColor(color)
      .lineWidth(thickness)
      .moveTo(this.left, this.y)
      .lineTo(this.right, this.y)
      .stroke()
    this.y += 8
  }

  doubleLine() {
    this.ensureSpace(14)
    this.doc.strokeColor(this.theme.colors.line).lineWidth(1.2)
      .moveTo(this.left, this.y).lineTo(this.right, this.y).stroke()
    this.doc.strokeColor(this.theme.colors.line).lineWidth(0.4)
      .moveTo(this.left, this.y + 3).lineTo(this.right, this.y + 3).stroke()
    this.y += 12
  }

  sectionTitle(label) {
    this.font('heading').size(this.theme.sectionSize || 11).fill(this.theme.colors.heading)
    this.wrappedText(label, { paddingBottom: 6 })
    if (this.theme.sectionUnderline) {
      this.y -= 4
      this.hline(this.theme.colors.accent, this.theme.sectionUnderline)
    }
  }

  tryDrawImage(source, x, y, options) {
    const buffer = decodeDataUrl(source)
    if (!buffer) return false
    try {
      this.doc.image(buffer, x, y, options)
      return true
    } catch {
      return false
    }
  }

  drawFooter(pageNumber, pageCount, quotation) {
    const y = PAGE_HEIGHT - this.margin + 4
    this.doc.save()
    this.doc.strokeColor(this.theme.colors.line).lineWidth(0.5)
      .moveTo(this.left, y - 10).lineTo(this.right, y - 10).stroke()
    this.doc.font(this.theme.fonts.body).fontSize(8).fillColor(this.theme.colors.muted)
    const number = quotation.quotationDetails?.quotationNumber || 'Quotation'
    const company = quotation.company?.name || ''
    this.doc.text(number, this.left, y - 6, { width: 180, align: 'left' })
    this.doc.text(`Page ${pageNumber} of ${pageCount}`, this.left, y - 6, {
      width: this.width,
      align: 'center',
    })
    this.doc.text(company, this.right - 180, y - 6, { width: 180, align: 'right' })
    this.doc.restore()
  }

  finalize(quotation) {
    const range = this.doc.bufferedPageRange()
    for (let index = 0; index < range.count; index += 1) {
      this.doc.switchToPage(range.start + index)
      this.drawFooter(index + 1, range.count, quotation)
    }
  }

  async toBuffer() {
    return new Promise((resolve, reject) => {
      const chunks = []
      this.doc.on('data', (chunk) => chunks.push(chunk))
      this.doc.on('end', () => resolve(Buffer.concat(chunks)))
      this.doc.on('error', reject)
      this.doc.end()
    })
  }
}

export { PAGE_HEIGHT, PAGE_WIDTH }
