import crypto from 'crypto'
import pool from '../config/database.js'
import { calculateQuotationTotals } from '../utils/money.js'
import { recordEvent } from './quotationEventModel.js'
import {
  buildPermissions,
  canDeleteQuotation,
  canEditQuotation,
  isAllowedTransition,
} from '../utils/quotationLifecycle.js'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

function emptyCoverLetter() {
  return {
    enabled: false,
    greeting: '',
    kindAttention: '',
    subject: '',
    message: '',
    closing: '',
    signOffCompany: '',
    signOffTitle: '',
  }
}

function mapRevisionFields(row) {
  return {
    quoteGroupId: row.quote_group_id,
    revisionNumber: Number(row.revision_number || 0),
    isLatest: row.is_latest !== false,
    archivedAt: row.archived_at || null,
  }
}

function mapListRow(row) {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...mapRevisionFields(row),
    quotationDetails: {
      quotationNumber: row.quotation_number,
      quotationDate: formatDate(row.quotation_date),
      referenceNumber: row.reference_number || '',
      subject: row.subject || '',
      currency: row.currency || 'INR',
    },
    customer: {
      companyName: row.customer_company_name || '',
    },
    summary: {
      grandTotal: Number(row.grand_total),
    },
    revisions: Array.isArray(row.revisions) ? row.revisions : [],
    permissions: buildPermissions({
      status: row.status,
      archivedAt: row.archived_at || null,
    }),
  }
}

function mapHeaderRow(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    company: {
      name: row.company_name_snapshot || '',
      logo: row.company_logo_snapshot || '',
      address: row.company_address_snapshot || '',
      phone: row.company_phone_snapshot || '',
      email: row.company_email_snapshot || '',
      website: row.company_website_snapshot || '',
      gstin: row.company_gstin_snapshot || '',
    },
    customer: {
      customerId: row.customer_id || '',
      companyName: row.customer_company_name || '',
      contactPerson: row.customer_contact_person || '',
      email: row.customer_email || '',
      phone: row.customer_phone || '',
      address: row.customer_address || '',
    },
    quotationDetails: {
      quotationNumber: row.quotation_number,
      quotationDate: formatDate(row.quotation_date),
      validUntil: formatDate(row.valid_until),
      referenceNumber: row.reference_number || '',
      subject: row.subject || '',
      currency: row.currency || 'INR',
    },
    coverLetter: {
      enabled: Boolean(row.cover_letter_enabled),
      greeting: row.cover_letter_greeting || '',
      kindAttention: row.cover_letter_attention || '',
      subject: row.cover_letter_subject || '',
      message: row.cover_letter_message || '',
      closing: row.cover_letter_closing || '',
      signOffCompany: row.cover_letter_sign_off_company || '',
      signOffTitle: row.cover_letter_sign_off_title || '',
    },
    notes: row.notes || '',
    paymentTerms: row.payment_terms || '',
    deliveryTerms: row.delivery_terms || '',
    bankDetails: {
      accountName: row.bank_account_name_snapshot || '',
      accountNumber: row.bank_account_number_snapshot || '',
      bankName: row.bank_name_snapshot || '',
      branch: row.bank_branch_snapshot || '',
      ifsc: row.bank_ifsc_snapshot || '',
    },
    signature: {
      name: row.signature_name_snapshot || '',
      designation: row.signature_designation_snapshot || 'Authorised Signatory',
      signatureImage: row.signature_image_snapshot || '',
    },
    selectedTemplate: {
      type: row.template_type || 'builtin',
      id: row.template_id || 'modern',
    },
    ...mapRevisionFields(row),
    summary: {
      grossAmount: Number(row.subtotal) + Number(row.total_discount),
      subtotal: Number(row.subtotal),
      totalDiscount: Number(row.total_discount),
      subtotalAfterDiscount: Number(row.taxable_amount),
      taxableAmount: Number(row.taxable_amount),
      taxAmount: Number(row.total_tax),
      additionalTotal: Number(row.additional_charges_total),
      grandTotal: Number(row.grand_total),
    },
  }
}

async function loadChildren(quotation) {
  const [itemsResult, termsResult, chargesResult] = await Promise.all([
    pool.query(
      `SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order, created_at`,
      [quotation.id],
    ),
    pool.query(
      `SELECT * FROM quotation_terms WHERE quotation_id = $1 ORDER BY sort_order, created_at`,
      [quotation.id],
    ),
    pool.query(
      `SELECT * FROM quotation_charges WHERE quotation_id = $1 ORDER BY sort_order, created_at`,
      [quotation.id],
    ),
  ])

  quotation.items = itemsResult.rows.map((item) => ({
    id: item.id,
    productId: item.product_id || '',
    description: item.description_snapshot || '',
    specification: item.specification_snapshot || '',
    quantity: Number(item.quantity),
    unit: item.unit || '',
    unitPrice: Number(item.unit_price),
    discountType: item.discount_type || 'percentage',
    discountValue: Number(item.discount_value),
    discountAmount: Number(item.discount_amount),
    taxRate: Number(item.tax_rate),
    taxAmount: Number(item.tax_amount),
    lineSubtotal: Number(item.line_subtotal),
    lineTotal: Number(item.line_total),
  }))

  quotation.terms = termsResult.rows.map((term) => term.term_text)
  quotation.additionalCharges = chargesResult.rows.map((charge) => ({
    id: charge.id,
    name: charge.name,
    amount: Number(charge.amount),
  }))

  if (!quotation.coverLetter) {
    quotation.coverLetter = emptyCoverLetter()
  }

  return quotation
}

const SORT_WHITELIST = {
  newest: 'updated_at DESC',
  oldest: 'updated_at ASC',
  quotation_number: 'quotation_number ASC, revision_number DESC',
  amount: 'grand_total DESC',
}

export async function getQuotations(companyId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 20))
  const offset = (page - 1) * limit
  const sort = SORT_WHITELIST[filters.sort] || SORT_WHITELIST.newest
  const latestOnly = filters.latestOnly !== 'false' && filters.latestOnly !== false
  const includeArchived = filters.archived === 'true' || filters.archived === true
  const archivedOnly = filters.archived === 'only'

  const clauses = ['company_id = $1']
  const params = [companyId]

  if (archivedOnly) {
    clauses.push('archived_at IS NOT NULL')
  } else if (!includeArchived) {
    clauses.push('archived_at IS NULL')
  }

  if (latestOnly) {
    clauses.push('is_latest = TRUE')
  }

  if (filters.status) {
    params.push(filters.status)
    clauses.push(`status = $${params.length}`)
  }

  if (filters.customer) {
    params.push(`%${filters.customer}%`)
    clauses.push(`customer_company_name ILIKE $${params.length}`)
  }

  if (filters.from) {
    params.push(filters.from)
    clauses.push(`quotation_date >= $${params.length}`)
  }

  if (filters.to) {
    params.push(filters.to)
    clauses.push(`quotation_date <= $${params.length}`)
  }

  if (filters.search) {
    params.push(`%${filters.search}%`)
    clauses.push(`(
      quotation_number ILIKE $${params.length}
      OR customer_company_name ILIKE $${params.length}
      OR COALESCE(reference_number, '') ILIKE $${params.length}
      OR COALESCE(subject, '') ILIKE $${params.length}
    )`)
  }

  const where = clauses.join(' AND ')
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM quotations WHERE ${where}`,
    params,
  )
  const total = countResult.rows[0]?.total || 0

  const listParams = [...params, limit, offset]
  const result = await pool.query(
    `SELECT id, status, created_at, updated_at, quotation_number, quotation_date,
            reference_number, subject, currency, customer_company_name, grand_total,
            quote_group_id, revision_number, is_latest, archived_at,
            (
              SELECT COALESCE(json_agg(json_build_object(
                'id', r.id,
                'revisionNumber', r.revision_number,
                'status', r.status,
                'createdAt', r.created_at,
                'isLatest', r.is_latest
              ) ORDER BY r.revision_number), '[]'::json)
              FROM quotations r
              WHERE r.quote_group_id = quotations.quote_group_id
                AND r.company_id = quotations.company_id
            ) AS revisions
     FROM quotations
     WHERE ${where}
     ORDER BY ${sort}
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams,
  )

  return {
    items: result.rows.map(mapListRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

async function attachGroupMeta(quotation, companyId) {
  const group = await pool.query(
    `SELECT id, revision_number, status, created_at, is_latest
     FROM quotations
     WHERE company_id = $1 AND quote_group_id = $2
     ORDER BY revision_number`,
    [companyId, quotation.quoteGroupId],
  )
  quotation.revisions = group.rows.map((row) => ({
    id: row.id,
    revisionNumber: Number(row.revision_number),
    status: row.status,
    createdAt: row.created_at,
    isLatest: row.is_latest,
  }))
  const latestDraft = [...quotation.revisions]
    .reverse()
    .find((revision) => revision.status === 'draft')
  quotation.permissions = buildPermissions(quotation, {
    latestDraftId: latestDraft?.id || null,
  })
  return quotation
}

export async function getQuotationById(id, companyId) {
  const result = await pool.query(
    `SELECT * FROM quotations WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  )
  if (!result.rows[0]) return null
  const quotation = await loadChildren(mapHeaderRow(result.rows[0]))
  return attachGroupMeta(quotation, companyId)
}

/** Used only after a public link token has already identified the quotation. */
export async function getQuotationByIdUnscoped(id) {
  const result = await pool.query(`SELECT * FROM quotations WHERE id = $1`, [id])
  if (!result.rows[0]) return null
  return loadChildren(mapHeaderRow(result.rows[0]))
}

export async function peekNextQuotationNumber(companyId) {
  const year = new Date().getFullYear()
  const result = await pool.query(
    `SELECT last_value FROM quotation_number_sequences WHERE company_id = $1 AND year = $2`,
    [companyId, year],
  )
  const next = (result.rows[0]?.last_value || 0) + 1
  return `QT-${year}-${String(next).padStart(3, '0')}`
}

export async function generateQuotationNumber(excludeId = null, companyId) {
  return peekNextQuotationNumber(companyId)
}

async function allocateQuotationNumber(client, companyId) {
  const year = new Date().getFullYear()
  const result = await client.query(
    `INSERT INTO quotation_number_sequences (company_id, year, last_value)
     VALUES ($1, $2, 1)
     ON CONFLICT (company_id, year)
     DO UPDATE SET last_value = quotation_number_sequences.last_value + 1
     RETURNING last_value`,
    [companyId, year],
  )
  return `QT-${year}-${String(result.rows[0].last_value).padStart(3, '0')}`
}

async function syncSequenceIfNeeded(client, companyId, quotationNumber) {
  const match = String(quotationNumber).match(/^QT-(\d{4})-(\d+)$/)
  if (!match) return
  const year = Number(match[1])
  const value = Number(match[2])
  await client.query(
    `INSERT INTO quotation_number_sequences (company_id, year, last_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (company_id, year)
     DO UPDATE SET last_value = GREATEST(quotation_number_sequences.last_value, EXCLUDED.last_value)`,
    [companyId, year, value],
  )
}

export async function resolveOwnedCustomerId(customerId, companyId) {
  if (!isUuid(customerId)) return null
  const result = await pool.query(
    `SELECT id FROM customers WHERE id = $1 AND company_id = $2`,
    [customerId, companyId],
  )
  return result.rows[0]?.id || null
}

function buildHeaderValues(data, companyId, totals) {
  const details = data.quotationDetails || {}
  const company = data.company || {}
  const customer = data.customer || {}
  const bank = data.bankDetails || {}
  const signature = data.signature || {}
  const cover = data.coverLetter || {}
  const template = data.selectedTemplate || { type: 'builtin', id: 'modern' }

  return {
    companyId,
    customerId: data.resolvedCustomerId || null,
    quotationNumber: details.quotationNumber.trim(),
    quotationDate: details.quotationDate || null,
    validUntil: details.validUntil || null,
    referenceNumber: details.referenceNumber?.trim() || null,
    subject: details.subject?.trim() || null,
    currency: details.currency || 'INR',
    status: data.status || 'draft',
    notes: data.notes || null,
    paymentTerms: data.paymentTerms || null,
    deliveryTerms: data.deliveryTerms || null,
    templateType: template.type || 'builtin',
    templateId: template.id || 'modern',
    customerCompanyName: customer.companyName?.trim() || null,
    customerContactPerson: customer.contactPerson?.trim() || null,
    customerEmail: customer.email?.trim() || null,
    customerPhone: customer.phone?.trim() || null,
    customerAddress: customer.address?.trim() || null,
    companyName: company.name?.trim() || null,
    companyLogo: company.logo || null,
    companyAddress: company.address?.trim() || null,
    companyPhone: company.phone?.trim() || null,
    companyEmail: company.email?.trim() || null,
    companyWebsite: company.website?.trim() || null,
    companyGstin: company.gstin?.trim() || null,
    coverEnabled: Boolean(cover.enabled),
    coverGreeting: cover.greeting || null,
    coverAttention: cover.kindAttention || null,
    coverSubject: cover.subject || null,
    coverMessage: cover.message || null,
    coverClosing: cover.closing || null,
    coverSignOffCompany: cover.signOffCompany || null,
    coverSignOffTitle: cover.signOffTitle || null,
    bankAccountName: bank.accountName?.trim() || null,
    bankAccountNumber: bank.accountNumber?.trim() || null,
    bankName: bank.bankName?.trim() || null,
    bankBranch: bank.branch?.trim() || null,
    bankIfsc: bank.ifsc?.trim() || null,
    signatureName: signature.name?.trim() || null,
    signatureDesignation: signature.designation?.trim() || null,
    signatureImage: signature.signatureImage || null,
    ...totals,
  }
}

async function replaceChildren(client, quotationId, items, charges, terms) {
  await client.query(`DELETE FROM quotation_items WHERE quotation_id = $1`, [quotationId])
  await client.query(`DELETE FROM quotation_charges WHERE quotation_id = $1`, [quotationId])
  await client.query(`DELETE FROM quotation_terms WHERE quotation_id = $1`, [quotationId])

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    await client.query(
      `INSERT INTO quotation_items (
         quotation_id, product_id, description_snapshot, specification_snapshot,
         quantity, unit, unit_price, discount_type, discount_value, discount_amount,
         tax_rate, tax_amount, line_subtotal, line_total, sort_order
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        quotationId,
        isUuid(item.productId) ? item.productId : null,
        item.description.trim(),
        item.specification?.trim() || null,
        item.quantity,
        item.unit?.trim() || null,
        item.unitPrice,
        item.discountType,
        item.discountValue,
        item.discountAmount,
        item.taxRate,
        item.taxAmount,
        item.lineSubtotal,
        item.lineTotal,
        index,
      ],
    )
  }

  for (let index = 0; index < charges.length; index += 1) {
    const charge = charges[index]
    if (!charge.name?.trim() && !Number(charge.amount)) continue
    await client.query(
      `INSERT INTO quotation_charges (quotation_id, name, amount, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [quotationId, charge.name?.trim() || 'Charge', Number(charge.amount) || 0, index],
    )
  }

  for (let index = 0; index < terms.length; index += 1) {
    const term = typeof terms[index] === 'string' ? terms[index] : terms[index]?.term_text
    if (!term?.trim()) continue
    await client.query(
      `INSERT INTO quotation_terms (quotation_id, term_text, sort_order)
       VALUES ($1, $2, $3)`,
      [quotationId, term.trim(), index],
    )
  }
}

const HEADER_COLUMNS = `
  company_id, customer_id, quotation_number, quotation_date, valid_until,
  reference_number, subject, currency, status, notes, payment_terms, delivery_terms,
  template_type, template_id,
  customer_company_name, customer_contact_person, customer_email, customer_phone, customer_address,
  company_name_snapshot, company_logo_snapshot, company_address_snapshot, company_phone_snapshot,
  company_email_snapshot, company_website_snapshot, company_gstin_snapshot,
  cover_letter_enabled, cover_letter_greeting, cover_letter_attention, cover_letter_subject,
  cover_letter_message, cover_letter_closing, cover_letter_sign_off_company, cover_letter_sign_off_title,
  bank_account_name_snapshot, bank_account_number_snapshot, bank_name_snapshot,
  bank_branch_snapshot, bank_ifsc_snapshot,
  signature_name_snapshot, signature_designation_snapshot, signature_image_snapshot,
  subtotal, total_discount, taxable_amount, total_tax, additional_charges_total, grand_total,
  quote_group_id, revision_number, is_latest
`

function headerParams(header) {
  return [
    header.companyId,
    header.customerId,
    header.quotationNumber,
    header.quotationDate,
    header.validUntil,
    header.referenceNumber,
    header.subject,
    header.currency,
    header.status,
    header.notes,
    header.paymentTerms,
    header.deliveryTerms,
    header.templateType,
    header.templateId,
    header.customerCompanyName,
    header.customerContactPerson,
    header.customerEmail,
    header.customerPhone,
    header.customerAddress,
    header.companyName,
    header.companyLogo,
    header.companyAddress,
    header.companyPhone,
    header.companyEmail,
    header.companyWebsite,
    header.companyGstin,
    header.coverEnabled,
    header.coverGreeting,
    header.coverAttention,
    header.coverSubject,
    header.coverMessage,
    header.coverClosing,
    header.coverSignOffCompany,
    header.coverSignOffTitle,
    header.bankAccountName,
    header.bankAccountNumber,
    header.bankName,
    header.bankBranch,
    header.bankIfsc,
    header.signatureName,
    header.signatureDesignation,
    header.signatureImage,
    header.subtotal,
    header.totalDiscount,
    header.taxableAmount,
    header.totalTax,
    header.additionalChargesTotal,
    header.grandTotal,
    header.quoteGroupId,
    header.revisionNumber,
    header.isLatest,
  ]
}

export async function createQuotation(data, companyId, actor = {}) {
  const charges = data.additionalCharges || []
  const { items, totals } = calculateQuotationTotals(data.items || [], charges)
  const header = buildHeaderValues({ ...data, resolvedCustomerId: data.resolvedCustomerId }, companyId, totals)
  const terms = data.terms || []
  header.quoteGroupId = crypto.randomUUID()
  header.revisionNumber = 0
  header.isLatest = true
  header.status = data.status === 'sent' ? 'sent' : 'draft'

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (!header.quotationNumber) {
      header.quotationNumber = await allocateQuotationNumber(client, companyId)
    } else {
      await syncSequenceIfNeeded(client, companyId, header.quotationNumber)
    }

    const inserted = await client.query(
      `INSERT INTO quotations (${HEADER_COLUMNS})
       VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
         $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
         $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51
       )
       RETURNING id`,
      headerParams(header),
    )

    const quotationId = inserted.rows[0].id
    await replaceChildren(client, quotationId, items, charges, terms)
    await recordEvent(client, {
      companyId,
      quotationId,
      quoteGroupId: header.quoteGroupId,
      userId: actor.userId,
      action: 'created',
      metadata: {
        quotationNumber: header.quotationNumber,
        revisionNumber: 0,
        status: header.status,
      },
    })
    if (header.status === 'sent') {
      await recordEvent(client, {
        companyId,
        quotationId,
        quoteGroupId: header.quoteGroupId,
        userId: actor.userId,
        action: 'status_changed',
        metadata: { fromStatus: 'draft', toStatus: 'sent' },
      })
    }
    await client.query('COMMIT')
    return getQuotationById(quotationId, companyId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function updateQuotation(id, data, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return null
  if (!canEditQuotation(existing)) {
    const error = new Error('This quotation has already been issued. Create a revision to make changes.')
    error.code = 'NOT_EDITABLE'
    throw error
  }

  const charges = data.additionalCharges || []
  const { items, totals } = calculateQuotationTotals(data.items || [], charges)
  const header = buildHeaderValues({ ...data, resolvedCustomerId: data.resolvedCustomerId }, companyId, totals)
  header.status = data.status === 'sent' ? 'sent' : 'draft'
  header.quotationNumber = existing.quotationDetails.quotationNumber
  const terms = data.terms || []

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updated = await client.query(
      `UPDATE quotations SET
         customer_id=$2, quotation_number=$3, quotation_date=$4, valid_until=$5,
         reference_number=$6, subject=$7, currency=$8, status=$9, notes=$10,
         payment_terms=$11, delivery_terms=$12, template_type=$13, template_id=$14,
         customer_company_name=$15, customer_contact_person=$16, customer_email=$17,
         customer_phone=$18, customer_address=$19,
         company_name_snapshot=$20, company_logo_snapshot=$21, company_address_snapshot=$22,
         company_phone_snapshot=$23, company_email_snapshot=$24, company_website_snapshot=$25,
         company_gstin_snapshot=$26,
         cover_letter_enabled=$27, cover_letter_greeting=$28, cover_letter_attention=$29,
         cover_letter_subject=$30, cover_letter_message=$31, cover_letter_closing=$32,
         cover_letter_sign_off_company=$33, cover_letter_sign_off_title=$34,
         bank_account_name_snapshot=$35, bank_account_number_snapshot=$36, bank_name_snapshot=$37,
         bank_branch_snapshot=$38, bank_ifsc_snapshot=$39,
         signature_name_snapshot=$40, signature_designation_snapshot=$41, signature_image_snapshot=$42,
         subtotal=$43, total_discount=$44, taxable_amount=$45, total_tax=$46,
         additional_charges_total=$47, grand_total=$48, updated_at=NOW()
       WHERE id=$1 AND company_id=$49
       RETURNING id`,
      [
        id,
        header.customerId,
        header.quotationNumber,
        header.quotationDate,
        header.validUntil,
        header.referenceNumber,
        header.subject,
        header.currency,
        header.status,
        header.notes,
        header.paymentTerms,
        header.deliveryTerms,
        header.templateType,
        header.templateId,
        header.customerCompanyName,
        header.customerContactPerson,
        header.customerEmail,
        header.customerPhone,
        header.customerAddress,
        header.companyName,
        header.companyLogo,
        header.companyAddress,
        header.companyPhone,
        header.companyEmail,
        header.companyWebsite,
        header.companyGstin,
        header.coverEnabled,
        header.coverGreeting,
        header.coverAttention,
        header.coverSubject,
        header.coverMessage,
        header.coverClosing,
        header.coverSignOffCompany,
        header.coverSignOffTitle,
        header.bankAccountName,
        header.bankAccountNumber,
        header.bankName,
        header.bankBranch,
        header.bankIfsc,
        header.signatureName,
        header.signatureDesignation,
        header.signatureImage,
        header.subtotal,
        header.totalDiscount,
        header.taxableAmount,
        header.totalTax,
        header.additionalChargesTotal,
        header.grandTotal,
        companyId,
      ],
    )

    if (!updated.rows[0]) {
      await client.query('ROLLBACK')
      return null
    }

    await replaceChildren(client, id, items, charges, terms)
    await recordEvent(client, {
      companyId,
      quotationId: id,
      quoteGroupId: existing.quoteGroupId,
      userId: actor.userId,
      action: 'updated',
      metadata: { revisionNumber: existing.revisionNumber },
    })
    if (header.status === 'sent' && existing.status === 'draft') {
      await recordEvent(client, {
        companyId,
        quotationId: id,
        quoteGroupId: existing.quoteGroupId,
        userId: actor.userId,
        action: 'status_changed',
        metadata: { fromStatus: 'draft', toStatus: 'sent' },
      })
    }
    await client.query('COMMIT')
    return getQuotationById(id, companyId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function deleteQuotation(id, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return { deleted: false }
  if (!canDeleteQuotation(existing)) {
    const error = new Error('Issued quotations cannot be deleted. Archive or cancel them instead.')
    error.code = 'NOT_DELETABLE'
    throw error
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await recordEvent(client, {
      companyId,
      quotationId: id,
      quoteGroupId: existing.quoteGroupId,
      userId: actor.userId,
      action: 'deleted',
      metadata: {
        quotationNumber: existing.quotationDetails.quotationNumber,
        revisionNumber: existing.revisionNumber,
      },
    })
    await client.query(`DELETE FROM quotations WHERE id = $1 AND company_id = $2`, [id, companyId])
    if (existing.isLatest) {
      await client.query(
        `UPDATE quotations SET is_latest = TRUE
         WHERE id = (
           SELECT id FROM quotations
           WHERE company_id = $1 AND quote_group_id = $2
           ORDER BY revision_number DESC
           LIMIT 1
         )`,
        [companyId, existing.quoteGroupId],
      )
    }
    await client.query('COMMIT')
    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function duplicateQuotation(id, companyId, actor = {}) {
  const original = await getQuotationById(id, companyId)
  if (!original) return null

  return createQuotation(
    {
      ...original,
      status: 'draft',
      resolvedCustomerId: original.customer?.customerId || null,
      quotationDetails: {
        ...original.quotationDetails,
        quotationNumber: '',
      },
    },
    companyId,
    { ...actor, sourceAction: 'duplicated' },
  ).then(async (created) => {
    await recordEvent(pool, {
      companyId,
      quotationId: created.id,
      quoteGroupId: created.quoteGroupId,
      userId: actor.userId,
      action: 'duplicated',
      metadata: {
        sourceId: original.id,
        sourceNumber: original.quotationDetails.quotationNumber,
        sourceRevision: original.revisionNumber,
      },
    })
    return created
  })
}

export async function updateQuotationStatus(id, status, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return null
  if (existing.archivedAt) {
    const error = new Error('Restore this quotation before changing its status.')
    error.code = 'ARCHIVED'
    throw error
  }
  if (!isAllowedTransition(existing.status, status)) {
    const error = new Error(`Cannot change status from ${existing.status} to ${status}.`)
    error.code = 'INVALID_TRANSITION'
    throw error
  }

  const result = await pool.query(
    `UPDATE quotations SET status = $1, updated_at = NOW()
     WHERE id = $2 AND company_id = $3
     RETURNING id, status`,
    [status, id, companyId],
  )
  await recordEvent(pool, {
    companyId,
    quotationId: id,
    quoteGroupId: existing.quoteGroupId,
    userId: actor.userId,
    action: 'status_changed',
    metadata: { fromStatus: existing.status, toStatus: status },
  })
  return result.rows[0] || null
}

export async function reviseQuotation(id, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return null
  if (!existing.permissions.canRevise) {
    const error = new Error(
      existing.permissions.latestDraftId
        ? 'A draft revision already exists. Edit that draft instead.'
        : 'This quotation cannot be revised.',
    )
    error.code = 'NOT_REVISABLE'
    error.latestDraftId = existing.permissions.latestDraftId
    throw error
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `SELECT id FROM quotations WHERE company_id = $1 AND quote_group_id = $2 FOR UPDATE`,
      [companyId, existing.quoteGroupId],
    )

    const nextRev = await client.query(
      `SELECT COALESCE(MAX(revision_number), 0) + 1 AS next
       FROM quotations WHERE company_id = $1 AND quote_group_id = $2`,
      [companyId, existing.quoteGroupId],
    )
    const revisionNumber = nextRev.rows[0].next

    await client.query(
      `UPDATE quotations SET is_latest = FALSE
       WHERE company_id = $1 AND quote_group_id = $2`,
      [companyId, existing.quoteGroupId],
    )

    const inserted = await client.query(
      `INSERT INTO quotations (
         ${HEADER_COLUMNS}
       )
       SELECT
         company_id, customer_id, quotation_number, quotation_date, valid_until,
         reference_number, subject, currency, 'draft', notes, payment_terms, delivery_terms,
         template_type, template_id,
         customer_company_name, customer_contact_person, customer_email, customer_phone, customer_address,
         company_name_snapshot, company_logo_snapshot, company_address_snapshot, company_phone_snapshot,
         company_email_snapshot, company_website_snapshot, company_gstin_snapshot,
         cover_letter_enabled, cover_letter_greeting, cover_letter_attention, cover_letter_subject,
         cover_letter_message, cover_letter_closing, cover_letter_sign_off_company, cover_letter_sign_off_title,
         bank_account_name_snapshot, bank_account_number_snapshot, bank_name_snapshot,
         bank_branch_snapshot, bank_ifsc_snapshot,
         signature_name_snapshot, signature_designation_snapshot, signature_image_snapshot,
         subtotal, total_discount, taxable_amount, total_tax, additional_charges_total, grand_total,
         quote_group_id, $3, TRUE
       FROM quotations
       WHERE id = $1 AND company_id = $2
       RETURNING id`,
      [id, companyId, revisionNumber],
    )

    const newId = inserted.rows[0].id

    await client.query(
      `INSERT INTO quotation_items (
         quotation_id, product_id, description_snapshot, specification_snapshot,
         quantity, unit, unit_price, discount_type, discount_value, discount_amount,
         tax_rate, tax_amount, line_subtotal, line_total, sort_order
       )
       SELECT $1, product_id, description_snapshot, specification_snapshot,
              quantity, unit, unit_price, discount_type, discount_value, discount_amount,
              tax_rate, tax_amount, line_subtotal, line_total, sort_order
       FROM quotation_items WHERE quotation_id = $2`,
      [newId, id],
    )
    await client.query(
      `INSERT INTO quotation_charges (quotation_id, name, amount, sort_order)
       SELECT $1, name, amount, sort_order FROM quotation_charges WHERE quotation_id = $2`,
      [newId, id],
    )
    await client.query(
      `INSERT INTO quotation_terms (quotation_id, term_text, sort_order)
       SELECT $1, term_text, sort_order FROM quotation_terms WHERE quotation_id = $2`,
      [newId, id],
    )

    await recordEvent(client, {
      companyId,
      quotationId: newId,
      quoteGroupId: existing.quoteGroupId,
      userId: actor.userId,
      action: 'revised',
      metadata: {
        sourceId: existing.id,
        sourceRevision: existing.revisionNumber,
        revisionNumber,
        quotationNumber: existing.quotationDetails.quotationNumber,
      },
    })

    await client.query('COMMIT')
    return getQuotationById(newId, companyId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function archiveQuotation(id, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return null
  if (existing.archivedAt) return existing

  await pool.query(
    `UPDATE quotations SET archived_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  )
  await recordEvent(pool, {
    companyId,
    quotationId: id,
    quoteGroupId: existing.quoteGroupId,
    userId: actor.userId,
    action: 'archived',
    metadata: { revisionNumber: existing.revisionNumber },
  })
  return getQuotationById(id, companyId)
}

export async function restoreQuotation(id, companyId, actor = {}) {
  const existing = await getQuotationById(id, companyId)
  if (!existing) return null
  if (!existing.archivedAt) return existing

  await pool.query(
    `UPDATE quotations SET archived_at = NULL, updated_at = NOW()
     WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  )
  await recordEvent(pool, {
    companyId,
    quotationId: id,
    quoteGroupId: existing.quoteGroupId,
    userId: actor.userId,
    action: 'restored',
    metadata: { revisionNumber: existing.revisionNumber },
  })
  return getQuotationById(id, companyId)
}

export async function getQuotationSummary(companyId) {
  const counts = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest)::int AS total,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'draft')::int AS draft,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'sent')::int AS sent,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'accepted')::int AS accepted,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'rejected')::int AS rejected,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'expired')::int AS expired,
       COUNT(*) FILTER (WHERE archived_at IS NULL AND is_latest AND status = 'cancelled')::int AS cancelled,
       COALESCE(SUM(grand_total) FILTER (WHERE archived_at IS NULL AND is_latest), 0) AS total_value
     FROM quotations
     WHERE company_id = $1`,
    [companyId],
  )

  const recent = await pool.query(
    `SELECT id, status, created_at, updated_at, quotation_number, quotation_date,
            currency, customer_company_name, grand_total, quote_group_id,
            revision_number, is_latest, archived_at
     FROM quotations
     WHERE company_id = $1 AND archived_at IS NULL AND is_latest
     ORDER BY updated_at DESC
     LIMIT 5`,
    [companyId],
  )

  const revised = await pool.query(
    `SELECT id, status, created_at, updated_at, quotation_number, quotation_date,
            currency, customer_company_name, grand_total, quote_group_id,
            revision_number, is_latest, archived_at
     FROM quotations
     WHERE company_id = $1 AND archived_at IS NULL AND revision_number > 0
     ORDER BY created_at DESC
     LIMIT 5`,
    [companyId],
  )

  return {
    counts: {
      ...counts.rows[0],
      totalValue: Number(counts.rows[0].total_value),
    },
    recent: recent.rows.map(mapListRow),
    recentlyRevised: revised.rows.map(mapListRow),
  }
}
