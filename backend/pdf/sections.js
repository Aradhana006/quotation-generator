import { PAGE_WIDTH } from './document.js'
import { formatMoney, formatPdfDate, hasAnyBankDetails, isPdfDrawableImage } from './format.js'

function contactLines(entity) {
  return [entity.address, entity.phone, entity.email, entity.website, entity.gstin ? `GSTIN: ${entity.gstin}` : '']
    .filter(Boolean)
}

/** Top letterhead: logo (right) or company name if no logo. White page, no colored bands. */
export function drawCompanyHeader(pdf, quotation) {
  const company = quotation.company || {}
  const logoWidth = 120
  const logoHeight = 44
  const logoX = pdf.right - logoWidth
  const logoDrawn = pdf.tryDrawImage(company.logo, logoX, pdf.y, {
    fit: [logoWidth, logoHeight],
  })

  if (logoDrawn) {
    pdf.y += logoHeight + 10
  } else {
    pdf.font('heading').size(14).fill(pdf.theme.colors.text)
    pdf.doc.text(company.name || 'Quotation', pdf.left, pdf.y, {
      width: pdf.width,
      align: 'right',
    })
    pdf.y += 20
  }

  pdf.doc
    .strokeColor(pdf.theme.colors.line)
    .lineWidth(0.8)
    .moveTo(pdf.left, pdf.y)
    .lineTo(pdf.right, pdf.y)
    .stroke()
  pdf.y += 12
}

/** Bottom block: company name + contact lines. */
export function drawCompanyFooter(pdf, quotation) {
  const company = quotation.company || {}
  // Stay with the content — do not jump to the bottom of the page.
  if (pdf.remaining() < 48) {
    pdf.addPage()
  }
  pdf.move(8)
  pdf.doc
    .strokeColor(pdf.theme.colors.line)
    .lineWidth(0.8)
    .moveTo(pdf.left, pdf.y)
    .lineTo(pdf.right, pdf.y)
    .stroke()
  pdf.y += 8

  pdf.font('heading').size(10).fill(pdf.theme.colors.text)
  pdf.wrappedText(company.name || 'Your Company', { paddingBottom: 2 })
  pdf.font('body').size(8).fill(pdf.theme.colors.muted)
  const lines = contactLines(company)
  if (lines.length) {
    pdf.wrappedText(lines.join('  ·  '), { paddingBottom: 2 })
  }
}

export function drawMeta(pdf, quotation, variant) {
  const details = quotation.quotationDetails || {}
  const downloadedOn = formatPdfDate(new Date().toISOString().slice(0, 10))
  const validityLabel =
    details.validityDays !== '' && details.validityDays != null
      ? `${details.validityDays} day(s)`
      : '—'
  const rows = [
    ['Quotation No.', details.quotationNumber || '—'],
    ['Revision', String(quotation.revisionNumber ?? 0)],
    ['Date', formatPdfDate(details.quotationDate)],
    ['Valid Until', formatPdfDate(details.validUntil)],
    ['Validity', validityLabel],
    ['Downloaded', downloadedOn],
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
    pdf.doc.text(
      `${rows[6][0]}: ${rows[6][1]}    ${rows[7][0]}: ${rows[7][1]}`,
      pdf.left + 10,
      pdf.y + 58,
      { width: pdf.width - 20 },
    )
    pdf.y += 96
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
    customer.referenceNumber ? `Ref: ${customer.referenceNumber}` : '',
    customer.gstin ? `GSTIN: ${customer.gstin}` : '',
    customer.address,
    customer.phone,
    customer.email,
  ].filter(Boolean)
  lines.forEach((line) => pdf.wrappedText(line, { paddingBottom: 2 }))
  pdf.move(8)
}

export function drawCoverLetter(pdf, quotation, { asCoverPage = false } = {}) {
  const cover = quotation.coverLetter || {}

  if (asCoverPage) {
    pdf.move(10)
    pdf.font('body').size(8).fill(pdf.theme.colors.muted)
    pdf.wrappedText('COVER LETTER', { paddingBottom: 10 })
  } else {
    pdf.ensureSpace(60)
    pdf.sectionTitle('Cover letter')
  }

  // Keep cover content packed — leftover white stays only at the bottom of the page.
  pdf.font('body').size(asCoverPage ? 10 : 10).fill(pdf.theme.colors.text)
  if (cover.greeting) pdf.wrappedText(cover.greeting, { paddingBottom: asCoverPage ? 8 : 6 })
  if (cover.kindAttention) {
    pdf.font('heading').size(10)
    pdf.wrappedText(`Kind Attn: ${cover.kindAttention}`, { paddingBottom: asCoverPage ? 8 : 5 })
    pdf.font('body').size(10)
  }
  if (cover.subject) {
    pdf.font('heading').size(10)
    pdf.wrappedText(`Subject: ${cover.subject}`, { paddingBottom: asCoverPage ? 8 : 5 })
    pdf.font('body').size(10)
  }
  if (cover.message) {
    pdf.wrappedText(cover.message, { paddingBottom: asCoverPage ? 10 : 8, lineGap: 2 })
  }
  if (cover.closing) pdf.wrappedText(cover.closing, { paddingBottom: asCoverPage ? 10 : 6 })
  pdf.font('heading').size(10)
  if (cover.signOffCompany) pdf.wrappedText(cover.signOffCompany, { paddingBottom: 2 })
  pdf.font('body').size(9).fill(pdf.theme.colors.muted)
  if (cover.signOffTitle) pdf.wrappedText(cover.signOffTitle, { paddingBottom: 6 })
}

export function drawItems(pdf, quotation) {
  const items = quotation.items || []
  const currency = quotation.quotationDetails?.currency || 'INR'
  const subject = quotation.quotationDetails?.subject

  if (subject) {
    pdf.font('heading').size(12).fill(pdf.theme.colors.text)
    pdf.wrappedText(subject, { paddingBottom: 10 })
  }

  const columns = [
    { key: 'no', label: 'Sno.', ratio: 0.08, align: 'center' },
    { key: 'description', label: 'Description', ratio: 0.46 },
    { key: 'price', label: 'Price', ratio: 0.16, align: 'center' },
    { key: 'qty', label: 'Qty', ratio: 0.1, align: 'center' },
    { key: 'total', label: 'Total Price', ratio: 0.2, align: 'center' },
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
    const specHeight = spec ? pdf.textHeight(spec, { width: descriptionWidth }) + 6 : 0
    const rowHeight = descHeight + specHeight + 12

    if (pdf.remaining() < rowHeight + 24) {
      pdf.addPage()
      drawHeader()
    }

    if (pdf.theme.cellBorders) {
      pdf.doc
        .rect(pdf.left, pdf.y, pdf.width, rowHeight)
        .strokeColor(pdf.theme.colors.tableBorder || pdf.theme.colors.line)
        .lineWidth(0.6)
        .stroke()
    }

    const values = {
      no: `${index + 1}.`,
      description,
      qty: String(item.quantity ?? ''),
      price: formatMoney(item.unitPrice, currency),
      total: formatMoney(item.lineTotal ?? 0, currency),
    }

    pdf.font('body').size(8).fill(pdf.theme.colors.text)
    let x = pdf.left + 4
    columns.forEach((column) => {
      if (column.key === 'description') {
        pdf.doc.text(values.description, x, pdf.y + 4, {
          width: column.width - 6,
          align: 'left',
        })
        if (spec.trim()) {
          pdf.font('body').size(7.5).fill(pdf.theme.colors.muted)
          pdf.doc.text(spec, x, pdf.y + 4 + descHeight, {
            width: column.width - 6,
            align: 'left',
            lineGap: 1.5,
          })
          pdf.font('body').size(8).fill(pdf.theme.colors.text)
        }
      } else {
        pdf.doc.text(values[column.key], x, pdf.y + 4, {
          width: column.width - 6,
          align: column.align || 'left',
        })
      }
      x += column.width
    })
    pdf.y += rowHeight
  })

  pdf.move(4)
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
      pdf.ensureSpace(14)
      pdf.doc.text(charge.name || 'Charge', pdf.left, pdf.y, { width: pdf.width - 120 })
      pdf.doc.text(formatMoney(charge.amount, currency), pdf.right - 120, pdf.y, {
        width: 120,
        align: 'right',
      })
      pdf.y += 13
    })
    pdf.move(4)
  }

  pdf.sectionTitle('Pricing summary')
  const boxWidth = 240
  const boxLeft = pdf.right - boxWidth
  pdf.ensureSpace(rows.length * 14 + 26)

  rows.forEach(([label, value]) => {
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.doc.text(label, boxLeft, pdf.y, { width: 120 })
    pdf.doc.text(formatMoney(value, currency), boxLeft + 120, pdf.y, { width: 120, align: 'right' })
    pdf.y += 13
  })

  pdf.doc.rect(boxLeft, pdf.y, boxWidth, 22).fill(pdf.theme.colors.totalBg)
  pdf.font('heading').size(11).fill(pdf.theme.colors.totalText)
  pdf.doc.text('Grand Total', boxLeft + 8, pdf.y + 6, { width: 110 })
  pdf.doc.text(formatMoney(summary.grandTotal, currency), boxLeft + 110, pdf.y + 6, {
    width: 122,
    align: 'right',
  })
  pdf.y += 28
}

function drawLabelValue(pdf, label, value) {
  if (!value && value !== 0) return
  pdf.ensureSpace(12)
  pdf.font('body').size(9).fill(pdf.theme.colors.text)
  pdf.doc.text(String(label), pdf.left, pdf.y, { width: 110 })
  pdf.doc.text(':', pdf.left + 112, pdf.y, { width: 10 })
  pdf.doc.text(String(value), pdf.left + 124, pdf.y, { width: pdf.width - 124 })
  pdf.y += 12
}

export function drawNotesAndTerms(pdf, quotation) {
  const details = quotation.quotationDetails || {}
  const company = quotation.company || {}
  const terms = quotation.terms || []

  pdf.font('heading').size(10).fill(pdf.theme.colors.text)
  pdf.wrappedText('TERMS & CONDITIONS', { paddingBottom: 6 })
  pdf.doc
    .moveTo(pdf.left, pdf.y - 4)
    .lineTo(pdf.left + 130, pdf.y - 4)
    .strokeColor(pdf.theme.colors.accent)
    .lineWidth(0.8)
    .stroke()

  const validity =
    details.validityDays !== '' && details.validityDays != null
      ? `${details.validityDays} Days`
      : details.validUntil
        ? `Until ${formatPdfDate(details.validUntil)}`
        : ''

  drawLabelValue(pdf, 'Validity', validity)
  drawLabelValue(pdf, 'Payment', quotation.paymentTerms)
  drawLabelValue(pdf, 'Delivery', quotation.deliveryTerms)
  drawLabelValue(pdf, 'GSTIN', company.gstin)

  terms.filter(Boolean).forEach((term) => {
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.wrappedText(`• ${term}`, { paddingBottom: 3 })
  })

  if (quotation.notes?.trim()) {
    pdf.move(2)
    pdf.font('body').size(9).fill(pdf.theme.colors.muted)
    pdf.wrappedText(quotation.notes, { paddingBottom: 4 })
  }
  pdf.move(4)
}

export function drawBankAndSignature(pdf, quotation) {
  const bank = quotation.bankDetails || {}
  if (hasAnyBankDetails(bank)) {
    pdf.font('heading').size(10).fill(pdf.theme.colors.text)
    pdf.wrappedText('Bank Details', { paddingBottom: 4 })
    pdf.doc
      .moveTo(pdf.left, pdf.y - 4)
      .lineTo(pdf.left + 90, pdf.y - 4)
      .strokeColor(pdf.theme.colors.accent)
      .lineWidth(0.8)
      .stroke()

    drawLabelValue(pdf, 'Account Name', bank.accountName)
    drawLabelValue(pdf, 'Account Number', bank.accountNumber)
    drawLabelValue(pdf, 'Bank Name', bank.bankName)
    drawLabelValue(pdf, 'Branch', bank.branch)
    drawLabelValue(pdf, 'IFSC', bank.ifsc)
    pdf.move(4)
  }

  const signature = quotation.signature || {}
  const company = quotation.company || {}
  const hasDrawableSignature = isPdfDrawableImage(signature.signatureImage)
  // Small reserve so signature stays with the schedule when possible (keeps 2 pages).
  pdf.ensureSpace(hasDrawableSignature ? 64 : 40)

  pdf.font('body').size(10).fill(pdf.theme.colors.text)
  pdf.wrappedText(`For ${company.name || 'Your Company'}`, { paddingBottom: 3 })
  const imageDrawn = pdf.tryDrawImage(signature.signatureImage, pdf.left, pdf.y, { fit: [100, 32] })
  if (imageDrawn) pdf.y += 36
  else pdf.y += 12
  pdf.font('body').size(9).fill(pdf.theme.colors.muted)
  pdf.wrappedText(signature.designation || 'Authorised Signatory', { paddingBottom: 1 })
  if (signature.name) {
    pdf.font('heading').size(9).fill(pdf.theme.colors.text)
    pdf.wrappedText(signature.name, { paddingBottom: 2 })
  }
}

function drawLetterMeta(pdf, quotation) {
  const details = quotation.quotationDetails || {}
  pdf.ensureSpace(16)
  pdf.font('body').size(10).fill(pdf.theme.colors.text)
  const left = details.referenceNumber || details.quotationNumber || '—'
  const right = formatPdfDate(details.quotationDate)
  pdf.doc.text(left, pdf.left, pdf.y, { width: pdf.width / 2 })
  pdf.doc.text(right, pdf.left + pdf.width / 2, pdf.y, { width: pdf.width / 2, align: 'right' })
  pdf.y += 14
}

function drawRecipient(pdf, quotation) {
  const customer = quotation.customer || {}
  pdf.font('body').size(10).fill(pdf.theme.colors.text)
  pdf.wrappedText('To', { paddingBottom: 1 })
  pdf.font('heading').size(11)
  pdf.wrappedText(customer.companyName || '—', { paddingBottom: 1 })
  pdf.font('body').size(10)
  if (customer.address) pdf.wrappedText(customer.address, { paddingBottom: 3, lineGap: 1 })
  if (customer.contactPerson) {
    pdf.font('heading').size(10)
    pdf.wrappedText(`Kind Attn: ${customer.contactPerson}`, { paddingBottom: 6 })
    pdf.font('body').size(10)
  } else {
    pdf.move(4)
  }
}

export function renderStandardQuotation(pdf, quotation, variant) {
  // Page 1: cover (packed top-to-bottom; leftover white only after last block)
  drawCompanyHeader(pdf, quotation, variant)
  drawLetterMeta(pdf, quotation)
  drawRecipient(pdf, quotation)
  drawCoverLetter(pdf, quotation, { asCoverPage: true })
  drawBankAndSignature(pdf, { ...quotation, bankDetails: {} })
  drawCompanyFooter(pdf, quotation)

  // Page 2: quotation schedule
  pdf.addPage()
  drawCompanyHeader(pdf, quotation, variant)
  drawItems(pdf, quotation)
  drawPricing(pdf, quotation)
  drawNotesAndTerms(pdf, quotation)
  drawBankAndSignature(pdf, quotation)
  drawCompanyFooter(pdf, quotation)
}
