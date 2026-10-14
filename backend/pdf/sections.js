import { formatMoney, formatPdfDate, hasAnyBankDetails, isPdfDrawableImage } from './format.js'

const BODY_SIZE = 10
const SMALL_SIZE = 8
const LABEL_COL = 110

const LEGACY_COVER_MESSAGES = [
  'Thank you for your enquiry. Please find our quotation for the requested requirements.',
  'With reference to your enquiry, we are pleased to submit our offer for industrial edge hardware to connect with your existing PLC.',
]

const STANDARD_COVER_MESSAGE =
  'Thank you for the order of the products, as previously committed. Further to our discussion, please find the enclosed quotation for the agreed quantity. Kindly share the purchase order along with the advance payment as per your delivery schedule so we can initiate production. Please feel free to reach out if you require any further clarification or assistance.'

function resolveCoverMessage(message) {
  const text = String(message || '').trim()
  if (!text || LEGACY_COVER_MESSAGES.includes(text)) return STANDARD_COVER_MESSAGE
  return text
}

/** Letterhead: company name (or logo) left + rule. Contact block is page-bottom footer. */
export function drawCompanyHeader(pdf, quotation) {
  const company = quotation.company || {}
  const startY = pdf.y

  const logoDrawn = pdf.tryDrawImage(company.logo, pdf.left, startY, {
    fit: [110, 40],
  })

  if (logoDrawn) {
    pdf.font('heading').size(12).fill(pdf.theme.colors.text)
    pdf.doc.text(company.name || 'Quotation', pdf.left + 120, startY + 10, {
      width: pdf.width - 120,
      align: 'left',
    })
    pdf.y = startY + 44
  } else {
    pdf.font('heading').size(14).fill(pdf.theme.colors.text)
    pdf.doc.text(company.name || 'Quotation', pdf.left, startY, {
      width: pdf.width,
      align: 'left',
    })
    pdf.y = startY + 20
  }

  pdf.doc
    .strokeColor(pdf.theme.colors.line)
    .lineWidth(0.7)
    .moveTo(pdf.left, pdf.y)
    .lineTo(pdf.right, pdf.y)
    .stroke()
  pdf.y += 14
}

/** 3-column company details pinned to the bottom of the content area. */
export function drawCompanyFooter(pdf, quotation) {
  const company = quotation.company || {}
  const blockHeight = 72
  if (pdf.y < pdf.contentBottom - blockHeight) {
    pdf.y = pdf.contentBottom - blockHeight
  }

  pdf.doc
    .strokeColor(pdf.theme.colors.line)
    .lineWidth(0.7)
    .moveTo(pdf.left, pdf.y)
    .lineTo(pdf.right, pdf.y)
    .stroke()
  pdf.y += 8

  pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText(company.name || 'Your Company', { paddingBottom: 4 })

  const colWidth = pdf.width / 3
  const labelY = pdf.y
  const columns = [
    { title: 'ADDRESS', lines: [company.address || '—'] },
    {
      title: 'EMAIL',
      lines: [company.email || '—', company.website].filter(Boolean),
    },
    {
      title: 'CONTACT',
      lines: [company.phone || '—', company.gstin ? `GSTIN: ${company.gstin}` : ''].filter(Boolean),
    },
  ]

  columns.forEach((column, index) => {
    const x = pdf.left + colWidth * index
    pdf.font('body').size(7).fill(pdf.theme.colors.muted)
    pdf.doc.text(column.title, x, labelY, { width: colWidth - 8 })
    pdf.font('body').size(SMALL_SIZE).fill(pdf.theme.colors.text)
    column.lines.forEach((line, lineIndex) => {
      pdf.doc.text(String(line), x, labelY + 11 + lineIndex * 11, {
        width: colWidth - 8,
      })
    })
  })
  pdf.y = labelY + 40
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

export function drawCustomer(pdf, quotation) {
  drawRecipient(pdf, quotation)
}

export function drawCoverLetter(pdf, quotation, { asCoverPage = false } = {}) {
  const cover = quotation.coverLetter || {}
  const gap = asCoverPage ? 10 : 6
  const message = resolveCoverMessage(cover.message)

  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  if (cover.greeting) pdf.wrappedText(cover.greeting, { paddingBottom: gap })
  if (cover.kindAttention) {
    pdf.wrappedText(`Kind Attn: ${cover.kindAttention}`, { paddingBottom: gap })
  }
  if (cover.subject) {
    pdf.wrappedText(`Subject: ${cover.subject}`, { paddingBottom: gap })
  }
  if (message) {
    pdf.wrappedText(message, { paddingBottom: gap + 2, lineGap: 3 })
  }
  if (cover.closing) pdf.wrappedText(cover.closing, { paddingBottom: gap })
  if (cover.signOffCompany) pdf.wrappedText(cover.signOffCompany, { paddingBottom: 2 })
  if (cover.signOffTitle) pdf.wrappedText(cover.signOffTitle, { paddingBottom: 6 })
}

function formatTableAmount(amount, currency) {
  if (currency === 'INR') {
    const value = Number(amount)
    const safe = Number.isFinite(value) ? value : 0
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(safe)
  }
  return formatMoney(amount, currency)
}

export function drawItems(pdf, quotation) {
  const items = quotation.items || []
  const currency = quotation.quotationDetails?.currency || 'INR'
  const subject = quotation.quotationDetails?.subject
  const border = pdf.theme.colors.tableBorder || '#111827'

  if (subject) {
    pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
    pdf.wrappedText(subject, { paddingBottom: 8 })
  }

  const columns = [
    { key: 'no', label: 'Sno.', ratio: 0.08, align: 'center' },
    { key: 'description', label: 'Description', ratio: 0.44, align: 'left' },
    { key: 'price', label: 'Price (₹)', ratio: 0.16, align: 'center' },
    { key: 'qty', label: 'Qty (No)', ratio: 0.12, align: 'center' },
    { key: 'total', label: 'Total Price (₹)', ratio: 0.2, align: 'center' },
  ].map((column) => ({ ...column, width: pdf.width * column.ratio }))

  const descriptionWidth = columns.find((column) => column.key === 'description').width - 10

  const drawHeader = () => {
    pdf.ensureSpace(22)
    const headerY = pdf.y
    pdf.doc.rect(pdf.left, headerY, pdf.width, 18).strokeColor(border).lineWidth(0.8).stroke()
    pdf.font('heading').size(SMALL_SIZE).fill(pdf.theme.colors.tableHeaderText)
    let x = pdf.left
    columns.forEach((column) => {
      pdf.doc
        .rect(x, headerY, column.width, 18)
        .strokeColor(border)
        .lineWidth(0.6)
        .stroke()
      pdf.doc.text(column.label, x + 3, headerY + 5, {
        width: column.width - 6,
        align: 'center',
      })
      x += column.width
    })
    pdf.y = headerY + 18
  }

  drawHeader()

  items.forEach((item, index) => {
    const description = item.description || '—'
    const specLines = String(item.specification || '')
      .split('\n')
      .map((line) => line.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean)
    const specText = specLines.map((line) => `• ${line}`).join('\n')

    pdf.font('body').size(SMALL_SIZE)
    const descHeight = Math.max(12, pdf.textHeight(description, { width: descriptionWidth }))
    const specHeight = specText
      ? pdf.textHeight(specText, { width: descriptionWidth, lineGap: 1.5 }) + 4
      : 0
    const rowHeight = Math.max(22, descHeight + specHeight + 10)

    if (pdf.remaining() < rowHeight + 24) {
      pdf.addPage()
      drawCompanyHeader(pdf, quotation)
      drawHeader()
    }

    const rowY = pdf.y
    let x = pdf.left
    columns.forEach((column) => {
      pdf.doc.rect(x, rowY, column.width, rowHeight).strokeColor(border).lineWidth(0.6).stroke()
      x += column.width
    })

    const values = {
      no: `${index + 1}.`,
      description,
      qty: String(item.quantity ?? ''),
      price: formatTableAmount(item.unitPrice, currency),
      total: formatTableAmount(item.lineTotal ?? 0, currency),
    }

    x = pdf.left
    columns.forEach((column) => {
      if (column.key === 'description') {
        pdf.font('body').size(SMALL_SIZE).fill(pdf.theme.colors.text)
        pdf.doc.text(values.description, x + 4, rowY + 4, {
          width: column.width - 8,
          align: 'left',
        })
        if (specText) {
          pdf.doc.text(specText, x + 4, rowY + 4 + descHeight, {
            width: column.width - 8,
            align: 'left',
            lineGap: 1.5,
          })
        }
      } else if (column.key === 'total') {
        pdf.font('heading').size(SMALL_SIZE).fill(pdf.theme.colors.text)
        pdf.doc.text(values.total, x + 3, rowY + 4, {
          width: column.width - 6,
          align: 'center',
        })
      } else {
        pdf.font('body').size(SMALL_SIZE).fill(pdf.theme.colors.text)
        pdf.doc.text(values[column.key], x + 3, rowY + 4, {
          width: column.width - 6,
          align: column.align || 'left',
        })
      }
      x += column.width
    })
    pdf.y = rowY + rowHeight
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
    pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
    pdf.wrappedText('Additional charges', { paddingBottom: 4 })
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

  pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText('Pricing summary', { paddingBottom: 4 })
  const boxWidth = 240
  const boxLeft = pdf.right - boxWidth
  pdf.ensureSpace(rows.length * 14 + 26)

  rows.forEach(([label, value]) => {
    pdf.font('body').size(9).fill(pdf.theme.colors.text)
    pdf.doc.text(label, boxLeft, pdf.y, { width: 120 })
    pdf.doc.text(formatMoney(value, currency), boxLeft + 120, pdf.y, { width: 120, align: 'right' })
    pdf.y += 13
  })

  pdf.doc.rect(boxLeft, pdf.y, boxWidth, 22).strokeColor(pdf.theme.colors.tableBorder).lineWidth(0.8).stroke()
  pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.doc.text('Grand Total', boxLeft + 8, pdf.y + 6, { width: 110 })
  pdf.doc.text(formatMoney(summary.grandTotal, currency), boxLeft + 110, pdf.y + 6, {
    width: 122,
    align: 'right',
  })
  pdf.y += 28
}

function drawLabelValue(pdf, label, value, { boldValue = false } = {}) {
  if (!value && value !== 0) return
  pdf.ensureSpace(14)
  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.doc.text(String(label), pdf.left, pdf.y, { width: LABEL_COL })
  pdf.doc.text(':', pdf.left + LABEL_COL + 2, pdf.y, { width: 10 })
  pdf.font(boldValue ? 'heading' : 'body').size(BODY_SIZE)
  pdf.doc.text(String(value), pdf.left + LABEL_COL + 14, pdf.y, {
    width: pdf.width - LABEL_COL - 14,
  })
  pdf.y += 14
}

function parseTermLine(term) {
  const text = String(term || '').trim().replace(/^[-•*]\s*/, '')
  if (!text) return null
  const match = text.match(/^([^:]+):\s*(.+)$/)
  if (!match) return { label: '', value: text, boldValue: false }
  const label = match[1].trim()
  const value = match[2].trim()
  const boldValue = /^(gst|gstin)$/i.test(label)
  return { label, value, boldValue }
}

function buildTermRows(quotation) {
  const details = quotation.quotationDetails || {}
  const company = quotation.company || {}
  const rows = []
  const seen = new Set()

  const push = (label, value, boldValue = false) => {
    const key = label.toLowerCase()
    if (!value || seen.has(key)) return
    seen.add(key)
    rows.push({ label, value, boldValue })
  }

  const validity =
    details.validityDays !== '' && details.validityDays != null
      ? `${details.validityDays} Days.`
      : details.validUntil
        ? `Until ${formatPdfDate(details.validUntil)}.`
        : ''

  push('Validity', validity)
  push('Payment', quotation.paymentTerms)
  push('Delivery', quotation.deliveryTerms)

  ;(quotation.terms || []).forEach((term) => {
    const parsed = parseTermLine(term)
    if (!parsed) return
    if (parsed.label) {
      push(parsed.label, parsed.value, parsed.boldValue)
    } else {
      push('Note', parsed.value, false)
    }
  })

  push('GSTIN', company.gstin, true)
  return rows
}

export function drawNotesAndTerms(pdf, quotation) {
  const rows = buildTermRows(quotation)

  pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText('TERMS & CONDITIONS', { paddingBottom: 2 })
  pdf.doc
    .moveTo(pdf.left, pdf.y)
    .lineTo(pdf.left + 128, pdf.y)
    .strokeColor(pdf.theme.colors.text)
    .lineWidth(0.8)
    .stroke()
  pdf.y += 8

  rows.forEach((row) => {
    drawLabelValue(pdf, row.label, row.value, { boldValue: row.boldValue })
  })

  if (quotation.notes?.trim()) {
    pdf.move(4)
    pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
    pdf.wrappedText(quotation.notes, { paddingBottom: 4, lineGap: 2 })
  }
  pdf.move(6)
}

export function drawBankAndSignature(pdf, quotation) {
  const bank = quotation.bankDetails || {}
  if (hasAnyBankDetails(bank)) {
    pdf.font('heading').size(BODY_SIZE).fill(pdf.theme.colors.text)
    pdf.wrappedText('Bank Details', { paddingBottom: 2 })
    pdf.doc
      .moveTo(pdf.left, pdf.y)
      .lineTo(pdf.left + 78, pdf.y)
      .strokeColor(pdf.theme.colors.text)
      .lineWidth(0.8)
      .stroke()
    pdf.y += 8

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
  pdf.ensureSpace(hasDrawableSignature ? 64 : 40)

  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText(`For ${company.name || 'Your Company'}`, { paddingBottom: 4 })
  const imageDrawn = pdf.tryDrawImage(signature.signatureImage, pdf.left, pdf.y, { fit: [100, 32] })
  if (imageDrawn) pdf.y += 36
  else pdf.y += 14
  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText(signature.designation || 'Authorised Signatory', { paddingBottom: 2 })
  if (signature.name) {
    pdf.wrappedText(signature.name, { paddingBottom: 2 })
  }
}

function drawLetterMeta(pdf, quotation) {
  const details = quotation.quotationDetails || {}
  pdf.ensureSpace(18)
  // Two blank lines after letterhead before meta
  pdf.move(16)
  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  const number = details.quotationNumber || '—'
  const date = formatPdfDate(details.quotationDate)
  pdf.doc.text(`Quotation No.: ${number}`, pdf.left, pdf.y, { width: pdf.width / 2 })
  pdf.doc.text(`Date: ${date}`, pdf.left + pdf.width / 2, pdf.y, {
    width: pdf.width / 2,
    align: 'right',
  })
  pdf.y += 18
}

function drawRecipient(pdf, quotation) {
  const customer = quotation.customer || {}
  pdf.font('body').size(BODY_SIZE).fill(pdf.theme.colors.text)
  pdf.wrappedText('To', { paddingBottom: 2 })
  pdf.wrappedText(customer.companyName || '—', { paddingBottom: 2 })
  if (customer.address) pdf.wrappedText(customer.address, { paddingBottom: 4, lineGap: 2 })
  if (customer.contactPerson) {
    pdf.wrappedText(`Kind Attn: ${customer.contactPerson}`, { paddingBottom: 10 })
  } else {
    pdf.move(8)
  }
}

export function renderStandardQuotation(pdf, quotation, variant) {
  // Page 1: cover letter
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
