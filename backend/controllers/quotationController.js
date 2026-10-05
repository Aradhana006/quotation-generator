import * as quotationEventModel from '../models/quotationEventModel.js'
import * as quotationModel from '../models/quotationModel.js'
import * as quotationPublicLinkModel from '../models/quotationPublicLinkModel.js'
import * as quotationResponseModel from '../models/quotationResponseModel.js'
import { sanitizePdfFilename } from '../pdf/format.js'
import { generateQuotationPdf } from '../services/pdfService.js'
import { canShareQuotation, QUOTATION_STATUSES } from '../utils/quotationLifecycle.js'
import { errorResponse, successResponse } from '../utils/response.js'

const ALLOWED_STATUSES = QUOTATION_STATUSES
const ALLOWED_DISCOUNT_TYPES = ['percentage', 'fixed']

function isValidDate(value) {
  if (!value) return true
  return !Number.isNaN(new Date(value).getTime())
}

function validateQuotationBody(body) {
  const details = body.quotationDetails || {}
  const customer = body.customer || {}
  const items = Array.isArray(body.items) ? body.items : []
  const charges = Array.isArray(body.additionalCharges) ? body.additionalCharges : []

  if (!details.quotationNumber?.trim()) {
    return 'Quotation number is required.'
  }

  if (!customer.companyName?.trim()) {
    return 'Customer is required.'
  }

  if (!isValidDate(details.quotationDate) || !isValidDate(details.validUntil)) {
    return 'Quotation dates are invalid.'
  }

  if (details.quotationDate && details.validUntil) {
    if (new Date(details.validUntil) < new Date(details.quotationDate)) {
      return 'Valid until cannot be earlier than the quotation date.'
    }
  }

  if (body.status && !ALLOWED_STATUSES.includes(body.status)) {
    return 'Invalid quotation status.'
  }

  if (items.length === 0) {
    return 'At least one quotation item is required.'
  }

  for (const [index, item] of items.entries()) {
    const position = index + 1
    if (!item.description?.trim()) {
      return `Item ${position}: description is required.`
    }

    const quantity = Number(item.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return `Item ${position}: quantity must be greater than 0.`
    }

    const unitPrice = Number(item.unitPrice)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return `Item ${position}: unit price cannot be negative.`
    }

    const discountValue = Number(item.discountValue || 0)
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      return `Item ${position}: discount cannot be negative.`
    }

    const discountType = item.discountType || 'percentage'
    if (!ALLOWED_DISCOUNT_TYPES.includes(discountType)) {
      return `Item ${position}: discount type must be percentage or fixed.`
    }

    const taxRate = Number(item.taxRate || 0)
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      return `Item ${position}: tax cannot be negative.`
    }
  }

  for (const [index, charge] of charges.entries()) {
    const amount = Number(charge.amount || 0)
    if (!Number.isFinite(amount) || amount < 0) {
      return `Charge ${index + 1}: amount cannot be negative.`
    }
  }

  return null
}

async function withResolvedCustomer(body, companyId) {
  const resolvedCustomerId = await quotationModel.resolveOwnedCustomerId(
    body.customer?.customerId,
    companyId,
  )
  return { ...body, resolvedCustomerId }
}

function actor(req) {
  return { userId: req.userId }
}

function lifecycleError(res, error, fallbackMessage) {
  if (error.code === '23505') {
    return errorResponse(res, 'CONFLICT', 'Quotation number already exists for this company.', 409)
  }
  if (error.code === 'NOT_EDITABLE' || error.code === 'NOT_REVISABLE' || error.code === 'INVALID_TRANSITION' || error.code === 'ARCHIVED') {
    return errorResponse(res, error.code, error.message, 409)
  }
  if (error.code === 'NOT_DELETABLE') {
    return errorResponse(res, error.code, error.message, 409)
  }
  console.error(fallbackMessage, error.message)
  return errorResponse(res, 'INTERNAL_ERROR', fallbackMessage, 500)
}

function conflictOrInternal(res, error, fallbackMessage) {
  return lifecycleError(res, error, fallbackMessage)
}

export async function getQuotations(req, res) {
  try {
    const result = await quotationModel.getQuotations(req.companyId, req.query)
    return successResponse(res, result.items, 'Quotations loaded.', 200, {
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('getQuotations error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load quotations.', 500)
  }
}

export async function getQuotationSummary(req, res) {
  try {
    const summary = await quotationModel.getQuotationSummary(req.companyId)
    return successResponse(res, summary, 'Dashboard summary loaded.')
  } catch (error) {
    console.error('getQuotationSummary error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load dashboard summary.', 500)
  }
}

export async function getQuotationById(req, res) {
  try {
    const quotation = await quotationModel.getQuotationById(req.params.id, req.companyId)
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, quotation, 'Quotation loaded.')
  } catch (error) {
    console.error('getQuotationById error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load quotation.', 500)
  }
}

export async function getNextQuotationNumber(req, res) {
  try {
    const quotationNumber = await quotationModel.peekNextQuotationNumber(req.companyId)
    return successResponse(res, { quotationNumber }, 'Quotation number generated.')
  } catch (error) {
    console.error('getNextQuotationNumber error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to generate quotation number.', 500)
  }
}

export async function createQuotation(req, res) {
  try {
    const validationError = validateQuotationBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const payload = await withResolvedCustomer(req.body, req.companyId)
    const quotation = await quotationModel.createQuotation(payload, req.companyId, actor(req))
    return successResponse(res, quotation, 'Quotation created.', 201)
  } catch (error) {
    return conflictOrInternal(res, error, 'Unable to create quotation.')
  }
}

export async function updateQuotation(req, res) {
  try {
    const validationError = validateQuotationBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const payload = await withResolvedCustomer(req.body, req.companyId)
    const quotation = await quotationModel.updateQuotation(
      req.params.id,
      payload,
      req.companyId,
      actor(req),
    )
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, quotation, 'Quotation updated.')
  } catch (error) {
    return conflictOrInternal(res, error, 'Unable to update quotation.')
  }
}

export async function deleteQuotation(req, res) {
  try {
    const deleted = await quotationModel.deleteQuotation(req.params.id, req.companyId, actor(req))
    if (!deleted?.deleted) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, { id: req.params.id }, 'Quotation deleted.')
  } catch (error) {
    return lifecycleError(res, error, 'Unable to delete quotation.')
  }
}

export async function duplicateQuotation(req, res) {
  try {
    const duplicate = await quotationModel.duplicateQuotation(req.params.id, req.companyId, actor(req))
    if (!duplicate) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, duplicate, 'Quotation duplicated.', 201)
  } catch (error) {
    return conflictOrInternal(res, error, 'Unable to duplicate quotation.')
  }
}

export async function downloadQuotationPdf(req, res) {
  try {
    const quotation = await quotationModel.getQuotationById(req.params.id, req.companyId)
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }

    const pdfBuffer = await generateQuotationPdf(quotation, req.companyId)
    const filename = sanitizePdfFilename(quotation)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', String(pdfBuffer.length))
    return res.send(pdfBuffer)
  } catch (error) {
    console.error('downloadQuotationPdf error:', error.message)
    return errorResponse(res, 'PDF_GENERATION_FAILED', 'Unable to generate PDF.', 500)
  }
}

export async function updateQuotationStatus(req, res) {
  try {
    const { status } = req.body
    if (!ALLOWED_STATUSES.includes(status)) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid quotation status.', 400)
    }

    const updated = await quotationModel.updateQuotationStatus(
      req.params.id,
      status,
      req.companyId,
      actor(req),
    )
    if (!updated) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }

    return successResponse(res, { id: updated.id, status: updated.status }, 'Status updated.')
  } catch (error) {
    return lifecycleError(res, error, 'Unable to update status.')
  }
}

export async function reviseQuotation(req, res) {
  try {
    const revision = await quotationModel.reviseQuotation(req.params.id, req.companyId, actor(req))
    if (!revision) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, revision, 'Revision created.', 201)
  } catch (error) {
    return lifecycleError(res, error, 'Unable to create revision.')
  }
}

export async function archiveQuotation(req, res) {
  try {
    const quotation = await quotationModel.archiveQuotation(req.params.id, req.companyId, actor(req))
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, quotation, 'Quotation archived.')
  } catch (error) {
    return lifecycleError(res, error, 'Unable to archive quotation.')
  }
}

export async function restoreQuotation(req, res) {
  try {
    const quotation = await quotationModel.restoreQuotation(req.params.id, req.companyId, actor(req))
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, quotation, 'Quotation restored.')
  } catch (error) {
    return lifecycleError(res, error, 'Unable to restore quotation.')
  }
}

export async function getQuotationHistory(req, res) {
  try {
    const history = await quotationEventModel.getQuotationHistory(req.params.id, req.companyId)
    if (!history) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, history, 'Quotation history loaded.')
  } catch (error) {
    console.error('getQuotationHistory error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load history.', 500)
  }
}

export async function createQuotationPublicLink(req, res) {
  try {
    const quotation = await quotationModel.getQuotationById(req.params.id, req.companyId)
    if (!quotation) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    if (!canShareQuotation(quotation)) {
      return errorResponse(res, 'NOT_SHAREABLE', 'This quotation cannot be shared.', 409)
    }

    const existing = await quotationPublicLinkModel.getActivePublicLink(quotation.id, req.companyId)
    if (existing?.active?.url) {
      return successResponse(
        res,
        {
          url: existing.active.url,
          expiresAt: existing.active.expiresAt,
          status: 'active',
          reused: true,
        },
        'Public link loaded.',
      )
    }

    const link = await quotationPublicLinkModel.createPublicLink({
      quotationId: quotation.id,
      companyId: req.companyId,
    })

    if (quotation.status === 'draft') {
      await quotationModel.updateQuotationStatus(quotation.id, 'sent', req.companyId, actor(req))
    }

    await quotationEventModel.recordEvent(null, {
      companyId: req.companyId,
      quotationId: quotation.id,
      quoteGroupId: quotation.quoteGroupId,
      userId: req.userId,
      action: 'public_link_created',
      metadata: { quotationRevision: quotation.revisionNumber ?? 0 },
    })

    return successResponse(
      res,
      {
        url: link.url,
        expiresAt: link.expiresAt,
        status: 'active',
        reused: false,
      },
      'Public link created.',
    )
  } catch (error) {
    console.error('createQuotationPublicLink error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to create public link.', 500)
  }
}

export async function getQuotationPublicLink(req, res) {
  try {
    const result = await quotationPublicLinkModel.getActivePublicLink(req.params.id, req.companyId)
    if (!result) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(
      res,
      result.active
        ? {
            url: result.active.url,
            expiresAt: result.active.expiresAt,
            status: 'active',
            lastAccessedAt: result.active.lastAccessedAt,
            createdAt: result.active.createdAt,
          }
        : null,
      result.active ? 'Public link loaded.' : 'No active public link.',
    )
  } catch (error) {
    console.error('getQuotationPublicLink error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load public link.', 500)
  }
}

export async function revokeQuotationPublicLinks(req, res) {
  try {
    const result = await quotationPublicLinkModel.revokePublicLinks(req.params.id, req.companyId)
    if (!result) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }

    const quotation = await quotationModel.getQuotationById(req.params.id, req.companyId)
    if (quotation) {
      await quotationEventModel.recordEvent(null, {
        companyId: req.companyId,
        quotationId: quotation.id,
        quoteGroupId: quotation.quoteGroupId,
        userId: req.userId,
        action: 'public_link_revoked',
        metadata: {
          quotationRevision: quotation.revisionNumber ?? 0,
          revoked: result.revoked,
        },
      })
    }

    return successResponse(res, result, 'Public links revoked.')
  } catch (error) {
    console.error('revokeQuotationPublicLinks error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to revoke public links.', 500)
  }
}

export async function getQuotationResponses(req, res) {
  try {
    const responses = await quotationResponseModel.getResponsesForQuotation(
      req.params.id,
      req.companyId,
    )
    if (!responses) {
      return errorResponse(res, 'NOT_FOUND', 'Quotation not found.', 404)
    }
    return successResponse(res, responses, 'Customer responses loaded.')
  } catch (error) {
    console.error('getQuotationResponses error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load customer responses.', 500)
  }
}
