import * as quotationEventModel from '../models/quotationEventModel.js'
import * as quotationModel from '../models/quotationModel.js'
import * as quotationPublicLinkModel from '../models/quotationPublicLinkModel.js'
import * as quotationResponseModel from '../models/quotationResponseModel.js'
import { getCustomTemplateById } from '../models/templateModel.js'
import { isValidEmail } from '../utils/emailValidation.js'
import {
  buildPublicPermissions,
  getPublicLockMessage,
  toPublicQuotation,
} from '../utils/publicQuotation.js'
import { errorResponse, successResponse } from '../utils/response.js'

const LINK_ERRORS = {
  LINK_INVALID: { status: 404, message: 'Quotation link is invalid.' },
  LINK_EXPIRED: { status: 410, message: 'Quotation link has expired.' },
  LINK_REVOKED: { status: 410, message: 'This quotation link is no longer available.' },
}

const inflightActions = new Map()

function acquireActionLock(key) {
  if (inflightActions.has(key)) return false
  inflightActions.set(key, Date.now())
  return true
}

function releaseActionLock(key) {
  inflightActions.delete(key)
}

function linkError(res, code) {
  const mapped = LINK_ERRORS[code] || LINK_ERRORS.LINK_INVALID
  return errorResponse(res, code in LINK_ERRORS ? code : 'LINK_INVALID', mapped.message, mapped.status)
}

async function loadPublicContext(token) {
  const resolved = await quotationPublicLinkModel.findLinkByToken(token)
  if (resolved.error) return resolved

  const quotation = await quotationModel.getQuotationByIdUnscoped(resolved.link.quotationId)
  if (!quotation) return { error: 'LINK_INVALID' }

  let customTemplate = null
  if (quotation.selectedTemplate?.type === 'custom' && quotation.selectedTemplate.id) {
    customTemplate = await getCustomTemplateById(
      quotation.selectedTemplate.id,
      quotation.companyId,
    )
  }

  const permissions = buildPublicPermissions(quotation)
  return {
    link: resolved.link,
    quotation,
    customTemplate,
    permissions,
    message: getPublicLockMessage(quotation, permissions),
  }
}

function parseCustomerFields(body = {}, { requireComment = false } = {}) {
  const customerName = String(body.customerName || body.name || '').trim()
  const customerEmail = String(body.customerEmail || body.email || '').trim()
  const comment = String(body.comment || body.reason || body.requestedChanges || '').trim()

  if (customerName.length > 200) return { error: 'Name is too long.' }
  if (customerEmail && !isValidEmail(customerEmail)) {
    return { error: 'Email format is invalid.' }
  }
  if (requireComment && !comment) return { error: 'A comment is required.' }
  if (comment.length > 4000) return { error: 'Comment is too long.' }

  return { value: { customerName, customerEmail, comment } }
}

async function buildPublicPayload(context) {
  return {
    quotation: toPublicQuotation(context.quotation, context.customTemplate),
    permissions: context.permissions,
    message: context.message,
  }
}

export async function getPublicQuotation(req, res) {
  try {
    const context = await loadPublicContext(req.params.token)
    if (context.error) return linkError(res, context.error)

    await quotationPublicLinkModel.touchPublicLink(context.link.id)

    if (await quotationEventModel.shouldRecordCustomerView(
      context.quotation.id,
      context.quotation.companyId,
    )) {
      await quotationEventModel.recordEvent(null, {
        companyId: context.quotation.companyId,
        quotationId: context.quotation.id,
        quoteGroupId: context.quotation.quoteGroupId,
        action: 'customer_viewed',
        metadata: { quotationRevision: context.quotation.revisionNumber ?? 0 },
      })
    }

    return successResponse(res, await buildPublicPayload(context), 'Quotation loaded.')
  } catch (error) {
    console.error('getPublicQuotation error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load quotation.', 500)
  }
}

async function submitPublicResponse(req, res, {
  responseType,
  statusToApply,
  requireComment,
  permissionKey,
  auditAction,
  successMessage,
}) {
  const lockKey = `${req.params.token}:${responseType}`
  if (!acquireActionLock(lockKey)) {
    return errorResponse(res, 'ACTION_IN_PROGRESS', 'This request is already being processed.', 409)
  }

  try {
    const parsed = parseCustomerFields(req.body, { requireComment })
    if (parsed.error) {
      return errorResponse(res, 'VALIDATION_ERROR', parsed.error, 400)
    }

    const context = await loadPublicContext(req.params.token)
    if (context.error) return linkError(res, context.error)

    if (!context.permissions[permissionKey]) {
      return errorResponse(
        res,
        'NOT_ACTIONABLE',
        context.message || 'This quotation cannot be updated.',
        409,
      )
    }

    if (await quotationResponseModel.hasRecentResponse(
      context.quotation.id,
      context.quotation.companyId,
    )) {
      return errorResponse(
        res,
        'ACTION_IN_PROGRESS',
        'This request is already being processed.',
        409,
      )
    }

    const response = await quotationResponseModel.createResponse({
      quotationId: context.quotation.id,
      companyId: context.quotation.companyId,
      publicLinkId: context.link.id,
      responseType,
      customerName: parsed.value.customerName,
      customerEmail: parsed.value.customerEmail,
      comment: parsed.value.comment,
    })

    if (statusToApply && context.quotation.status === 'sent') {
      await quotationModel.updateQuotationStatus(
        context.quotation.id,
        statusToApply,
        context.quotation.companyId,
        {},
      )
    }

    await quotationEventModel.recordEvent(null, {
      companyId: context.quotation.companyId,
      quotationId: context.quotation.id,
      quoteGroupId: context.quotation.quoteGroupId,
      action: auditAction,
      metadata: {
        responseId: response.id,
        quotationRevision: context.quotation.revisionNumber ?? 0,
      },
    })

    const refreshed = await loadPublicContext(req.params.token)
    return successResponse(
      res,
      await buildPublicPayload(refreshed.error ? context : refreshed),
      successMessage,
    )
  } catch (error) {
    if (error.code === 'INVALID_TRANSITION') {
      return errorResponse(res, 'NOT_ACTIONABLE', error.message, 409)
    }
    console.error(`${auditAction} error:`, error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to submit response.', 500)
  } finally {
    releaseActionLock(lockKey)
  }
}

export async function acceptPublicQuotation(req, res) {
  return submitPublicResponse(req, res, {
    responseType: 'accepted',
    statusToApply: 'accepted',
    requireComment: false,
    permissionKey: 'canAccept',
    auditAction: 'customer_accepted',
    successMessage: 'Quotation accepted.',
  })
}

export async function rejectPublicQuotation(req, res) {
  return submitPublicResponse(req, res, {
    responseType: 'rejected',
    statusToApply: 'rejected',
    requireComment: true,
    permissionKey: 'canReject',
    auditAction: 'customer_rejected',
    successMessage: 'Quotation rejected.',
  })
}

export async function requestPublicChanges(req, res) {
  return submitPublicResponse(req, res, {
    responseType: 'changes_requested',
    statusToApply: null,
    requireComment: true,
    permissionKey: 'canRequestChanges',
    auditAction: 'customer_requested_changes',
    successMessage: 'Change request submitted.',
  })
}
