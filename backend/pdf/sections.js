import { PAGE_WIDTH } from './document.js'
import { formatMoney, formatPdfDate, hasAnyBankDetails } from './format.js'

function contactLines(entity) {
  return [entity.address, entity.phone, entity.email, entity.website, entity.gstin ? `GSTIN: ${entity.gstin}` : '']
    .filter(Boolean)
}

export function drawCompanyHeader(pdf, quotation, variant) {
  const company = quotation.company || {}

  if (variant === 'professional') {
    const bandHeight = 72
    pdf.doc.rect(0, 0, PAGE_WIDTH, bandHeight).fill(pdf.theme.colors.headerBg)
    const logoOnBand = pdf.tryDrawImage(company.logo, pdf.left, 14, { fit: [56, 44] })
    pdf.doc.fillColor('#ffffff').font(pdf.theme.fonts.heading).fontSize(18)
    pdf.doc.text(company.name || 'Quotation', logoOnBand ? pdf.left + 68 : pdf.left, 18, {
      width: pdf.width - 80,
    })
    pdf.doc.font(pdf.theme.fonts.body).fontSize(8)
    pdf.doc.text(contactLines(company).join('  ·  '), logoOnBand ? pdf.left + 68 : pdf.left, 42, {
      width: pdf.width - 80,
    })
    pdf.y = bandHeight + 20
    return
  }

  if (variant === 'classic') {
    const logoX = (PAGE_WIDTH - 56) / 2
    if (pdf.tryDrawImage(company.logo, logoX, pdf.y, { fit: [56, 40] })) {
      pdf.y += 46
    }
    pdf.font('heading').size(20).fill(pdf.theme.colors.heading)
    pdf.wrappedText(company.name || 'Quotation', { align: 'center', paddingBottom: 4 })
    pdf.font('body').size(9).fill(pdf.theme.colors.muted)
    pdf.wrappedText(contactLines(company).join(' | '), { align: 'center', paddingBottom: 4 })
    pdf.doubleLine()
    return
  }

  const logoDrawn = pdf.tryDrawImage(company.logo, pdf.left, pdf.y, { fit: [72, 48] })
  if (logoDrawn) {
    pdf.font('heading').size(20).fill(pdf.theme.colors.heading)
    pdf.doc.text(company.name || 'Quotation', pdf.left + 84, pdf.y, { width: pdf.width - 84 })
    pdf.font('body').size(8).fill(pdf.theme.colors.muted)
    pdf.doc.text(contactLines(company).join('\n'), pdf.left + 84, pdf.y + 22, {
      width: pdf.width - 84,
    })
    pdf.y += 56
  } else {
    pdf.font('heading').size(22).fill(pdf.theme.colors.heading)
    pdf.wrappedText(company.name || 'Quotation', { paddingBottom: 4 })
    pdf.font('body').size(9).fill(pdf.theme.colors.muted)
    pdf.wrappedText(contactLines(company).join('  ·  '), { paddingBottom: 6 })
  }
  pdf.hline(pdf.theme.colors.accent, 1.2)
}

export function drawMeta(pdf, quotation, variant) {
  const details = quotation.quotationDetails || {}
  const rows = [
    ['Quotation No.', details.quotationNumber || '—'],
    ['Revision', String(quotation.revisionNumber ?? 0)],
    ['Date', formatPdfDate(details.quotationDate)],
    ['Valid Until', formatPdfDate(details.validUntil)],
    ['Reference', details.referenceNumber || '—'],
    ['Subject', details.subject || '—'],
  ]

  if (variant === 'professional') {
    pdf.ensureSpace(78)
    pdf.doc.rect(pdf.left, pdf.y, pdf.width, 70).strokeColor(pdf.theme.colors.line).lineWidth(0.8).stroke()
    const colWidth = pdf.width / 3
    ;[rows[0], rows[2], rows[3]].forEach((row, index) => {
      const x = pdf.left + 10 + colWidth * index
      pdf.doc.font(pdf.theme.fonts.body).fontSize(7).fillColor(pdf.theme.colors.muted)
      pdf.doc.text(row[0].toUpperCase(), x, pdf.y + 8, { width: colWidth - 16 })
      pdf.doc.font(pdf.theme.fonts.heading).fontSize(10).fillColor(pdf.theme.colors.text)
      pdf.doc.text(row[1], x, pdf.y + 20, { width: colWidth - 16 })
    })
    pdf.doc.font(pdf.theme.fonts.body).fontSize(8).fillColor(pdf.theme.colors.muted)
    pdf.doc.text(
      `${rows[1][0]}: ${rows[1][1]}    ${rows[4][0]}: ${rows[4][1]}    ${rows[5][0]}: ${rows[5][1]}`,
      pdf.left + 10,
      pdf.y + 46,
      { width: pdf.width - 20 },
    )
    pdf.y += 84
    return
  }

  pdf.sectionTitle(variant === 'classic' ? 'QUOTATION' : 'Quotation details')
  pdf.font('body').size(9).fill(pdf.theme.colors.text)
  rows.forEach(([label, value]) => {
    pdf.ensureSpace(16)
    pdf.doc.font(pdf.theme.fonts.heading).text(`${label}:`, pdf.left, pdf.y, { width: 110, continued: false })
    pdf.doc.font(pdf.theme.fonts.body).text(value, pdf.left + 110, pdf.y, { width: pdf.width - 110 })
    pdf.y += 14
  })
  pdf.move(6)
}

export function drawCustomer(pdf, quotation, variant) {
  const customer = quotation.customer || {}
  pdf.sectionTitle(variant === 'classic' ? 'To' : 'Bill To')
  pdf.font('heading').size(11).fill(pdf.theme.colors.text)
  pdf.wrappedText(customer.companyName || '—', { paddingBottom: 2 })
  pdf.font('body').size(9).fill(pdf.theme.colors.muted)
  const lines = [
    customer.contactPerson ? `Kind Attn: ${customer.contactPerson}` : '',
    customer.address,
    customer.phone,
    customer.email,
  ].filter(Boolean)
  lines.forEach((line) => pdf.wrappedText(line, { paddingBottom: 2 }))
  pdf.move(8)
}

export function drawCoverLetter(pdf, quotation) {
  const cover = quotation.coverLetter || {}
  if (!cover.enabled) return

  pdf.ensureSpace(80)
  pdf.sectionTitle('Cover letter')
  pdf.font('body').size(10).fill(pdf.theme.colors.text)
  if (cover.greeting) pdf.wrappedText(cover.greeting, { paddingBottom: 8 })
  if (cover.kindAttention) pdf.wrappedText(`Kind Attn: ${cover.kindAttention}`, { paddingBottom: 6 })
  if (cover.subject) {
    pdf.font('heading').size(10)
    pdf.wrappedText(`Subject: ${cover.subject}`, { paddingBottom: 8 })
    pdf.font('body').size(10)
  }
  if (cover.message) pdf.wrappedText(cover.message, { paddingBottom: 10, lineGap: 3 })
  if (cover.closing) pdf.wrappedText(cover.closing, { paddingBottom: 8 })
  pdf.font('heading').size(10)
  if (cover.signOffCompany) pdf.wrappedText(cover.signOffCompany, { paddingBottom: 2 })
  pdf.font('body').size(9).fill(pdf.theme.colors.muted)
  if (cover.signOffTitle) pdf.wrappedText(cover.signOffTitle, { paddingBottom: 10 })
}

export function drawItems(pdf, quotation) {
  const items = quotation.items || []
  const currency = quotation.quotationDetails?.currency || 'INR'
  pdf.sectionTitle('Quotation items')

  const columns = [
    { key: 'no', label: 'S.No', ratio: 0.055, align: 'center' },
    { key: 'description', label: 'Description', ratio: 0.34 },
    { key: 'qty', label: 'Qty', ratio: 0.07, align: 'right' },
    { key: 'unit', label: 'Unit', ratio: 0.08 },
    { key: 'price', label: 'Unit Price', ratio: 0.14, align: 'right' },
    { key: 'discount', label: 'Disc.', ratio: 0.09, align: 'right' },
    { key: 'tax', label: 'Tax', ratio: 0.075, align: 'right' },
    { key: 'total', label: 'Total', ratio: 0.15, align: 'right' },
  ].map((column) => ({ ...column, width: pdf.width * column.ratio }))

  const descriptionWidth = columns.find((column) => column.key === 'description').width - 10

  const drawHeader = () => {
    pdf.ensureSpace(22)
    pdf.doc.rect(pdf.left, pdf.y, pdf.width, 18).fill(pdf.theme.colors.tableHeaderBg)
    pdf.font('heading').size(8).fill(pdf.theme.colors.tableHeaderText)
    let x = pdf.left + 4
    columns.forEach((column) => {
      pdf.doc.text(column.label, x, pdf.y + 5, { width: column.width - 6, align: column.align || 'left' })
      x += column.width
    })
    pdf.y += 20
  }

  drawHeader()

  items.forEach((item, index) => {
    const description = item.description || '—'
    const spec = item.specification || ''
    pdf.font('body').size(8)
    const descHeight = Math.max(12, pdf.textHeight(description, { width: descriptionWidth }))
    const specHeight = spec ? pdf.textHeight(spec, { width: pdf.width - 16 }) + 8 : 0
    const rowHeight = descHeight + 10

    if (pdf.remaining() < rowHeight + specHeight + 24) {
      pdf.addPage()
      drawHeader()
    }

    if (index % 2 === 1 && pdf.theme.stripedRows) {
      pdf.doc.rect(pdf.left, pdf.y, pdf.width, rowHeight).fill(pdf.theme.colors.stripe)
    }

    if (pdf.theme.cellBorders) {
      pdf.doc.rect(pdf.left, pdf.y, pdf.width, rowHeight).strokeColor(pdf.theme.colors.line).lineWidth(0.4).stroke()
    }

    const discountLabel =
      item.discountType === 'fixed'
        ? formatMoney(item.discountValue || item.discountAmount || 0, currency)
        : `${Number(item.discountValue) || 0}%`

    const values = {
      no: String(index + 1),
      description,
      qty: String(item.quantity ?? ''),
      unit: item.unit || '',
      price: formatMoney(item.unitPrice, currency),
      discount: discountLabel,
      tax: `${Number(item.taxRate) || 0}%`,
      total: formatMoney(item.lineTotal ?? 0, currency),
    }

    pdf.font('body').size(8).fill(pdf.theme.colors.text)
    let x = pdf.left + 4
    columns.forEach((column) => {
      pdf.doc.text(values[column.key], x, pdf.y + 4, {
        width: column.width - 6,
        align: column.align || 'left',
      })
      x += column.width
    })
    pdf.y += rowHeight

    if (spec.trim()) {
      pdf.ensureSpace(specHeight + 6)
      pdf.font('body').size(8).fill(pdf.theme.colors.muted)
      pdf.wrappedText(spec, { paddingBottom: 8, lineGap: 2 })
    }
  })

  pdf.move(8)
}

export function drawPricing(pdf, quotation) {
  const summary = quotation.summary || {}
  const currency = quotation.quotationDetails?.currency || 'INR'
  const charges = quotation.additionalCharges || []
  const rows = [
    ['Subtotal', summary.subtotal],
    ['Total Discount', summary.totalDiscount],
    ['Taxable Amount', summary.taxableAmount ?? summary.subtotalAfterDiscount],
    ['Tax', summary.taxAmount],
  ]

  if (charges.length) {
    pdf.sectionTitle('Additional charges')
    charges.forEach((charge) => {
      pdf.font('body').size(9).fill(pdf.theme.colors.text)
      pdf.ensureSpace(16)
      pdf.doc.text(charge.name || 'Charge', pdf.left, pdf.y, { width: pdf.width - 120 })
      pdf.doc.text(formatMoney(charge.amount, currency), pdf.right - 120, pdf.y, {
        width: 120,
        align: 'right',
      })
      pdf.y += 14
    })
    pdf.move(6)
  }

  pdf.sectionTitle('Pricing summary')
  const boxWidth = 240
  const boxLeft = pdf.right - boxWidth
  pdf.ensureSpace(rows.length * 16 + 28)

  rows.forEach(([label, value]) => {
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.doc.text(label, boxLeft, pdf.y, { width: 120 })
    pdf.doc.text(formatMoney(value, currency), boxLeft + 120, pdf.y, { width: 120, align: 'right' })
    pdf.y += 15
  })

  pdf.doc.rect(boxLeft, pdf.y, boxWidth, 22).fill(pdf.theme.colors.totalBg)
  pdf.font('heading').size(11).fill(pdf.theme.colors.totalText)
  pdf.doc.text('Grand Total', boxLeft + 8, pdf.y + 6, { width: 110 })
  pdf.doc.text(formatMoney(summary.grandTotal, currency), boxLeft + 110, pdf.y + 6, {
    width: 122,
    align: 'right',
  })
  pdf.y += 32
}

export function drawNotesAndTerms(pdf, quotation) {
  if (quotation.notes?.trim()) {
    pdf.sectionTitle('Notes')
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.wrappedText(quotation.notes, { paddingBottom: 10 })
  }

  if (quotation.paymentTerms?.trim()) {
    pdf.sectionTitle('Payment terms')
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.wrappedText(quotation.paymentTerms, { paddingBottom: 10 })
  }

  if (quotation.deliveryTerms?.trim()) {
    pdf.sectionTitle('Delivery terms')
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.wrappedText(quotation.deliveryTerms, { paddingBottom: 10 })
  }

  const terms = quotation.terms || []
  if (terms.length) {
    pdf.sectionTitle('Terms & conditions')
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    terms.forEach((term, index) => {
      pdf.wrappedText(`${index + 1}. ${term}`, { paddingBottom: 4 })
    })
    pdf.move(6)
  }
}

export function drawBankAndSignature(pdf, quotation) {
  const bank = quotation.bankDetails || {}
  if (hasAnyBankDetails(bank)) {
    pdf.sectionTitle('Bank details')
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    const lines = [
      ['Account Name', bank.accountName],
      ['Account Number', bank.accountNumber],
      ['Bank Name', bank.bankName],
      ['Branch', bank.branch],
      ['IFSC', bank.ifsc],
    ].filter(([, value]) => value)
    lines.forEach(([label, value]) => {
      pdf.ensureSpace(14)
      pdf.doc.font(pdf.theme.fonts.heading).text(`${label}:`, pdf.left, pdf.y, { width: 120 })
      pdf.doc.font(pdf.theme.fonts.body).text(value, pdf.left + 120, pdf.y, { width: pdf.width - 120 })
      pdf.y += 13
    })
    pdf.move(10)
  }

  const signature = quotation.signature || {}
  pdf.ensureSpace(80)
  pdf.sectionTitle('Authorised signatory')
  const imageDrawn = pdf.tryDrawImage(signature.signatureImage, pdf.left, pdf.y, { fit: [120, 40] })
  if (imageDrawn) pdf.y += 46
  pdf.font('heading').size(10).fill(pdf.theme.colors.text)
  pdf.wrappedText(signature.name || quotation.coverLetter?.signOffCompany || quotation.company?.name || '', {
    paddingBottom: 2,
  })
  pdf.font('body').size(9).fill(pdf.theme.colors.muted)
  pdf.wrappedText(signature.designation || 'Authorised Signatory', { paddingBottom: 4 })
}

export function renderStandardQuotation(pdf, quotation, variant) {
  drawCompanyHeader(pdf, quotation, variant)
  drawMeta(pdf, quotation, variant)
  drawCustomer(pdf, quotation, variant)
  drawCoverLetter(pdf, quotation)

  if (quotation.coverLetter?.enabled && pdf.remaining() < 140) {
    pdf.addPage()
  }

  drawItems(pdf, quotation)
  drawPricing(pdf, quotation)
  drawNotesAndTerms(pdf, quotation)
  drawBankAndSignature(pdf, quotation)
}
