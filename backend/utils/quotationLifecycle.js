export const QUOTATION_STATUSES = [
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
]

export const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['accepted', 'rejected', 'expired', 'cancelled'],
  accepted: [],
  rejected: ['cancelled'],
  expired: ['cancelled'],
  cancelled: [],
}

export const REVISABLE_STATUSES = ['sent', 'accepted', 'rejected', 'expired', 'cancelled']

export function isAllowedTransition(fromStatus, toStatus) {
  return (ALLOWED_STATUS_TRANSITIONS[fromStatus] || []).includes(toStatus)
}

export function canEditQuotation(quotation) {
  return quotation?.status === 'draft' && !quotation.archivedAt
}

export function canReviseQuotation(quotation) {
  return REVISABLE_STATUSES.includes(quotation?.status) && !quotation.archivedAt
}

export function canDeleteQuotation(quotation) {
  return quotation?.status === 'draft' && !quotation.archivedAt
}

export function canArchiveQuotation(quotation) {
  return Boolean(quotation) && !quotation.archivedAt
}

export function canRestoreQuotation(quotation) {
  return Boolean(quotation?.archivedAt)
}

export function canShareQuotation(quotation) {
  if (!quotation || quotation.archivedAt) return false
  return quotation.status !== 'cancelled'
}

export function buildPermissions(quotation, { latestDraftId = null } = {}) {
  const reviseBlockedByDraft = Boolean(latestDraftId && latestDraftId !== quotation.id)
  return {
    canEdit: canEditQuotation(quotation),
    canRevise: canReviseQuotation(quotation) && !reviseBlockedByDraft,
    canDelete: canDeleteQuotation(quotation),
    canArchive: canArchiveQuotation(quotation),
    canRestore: canRestoreQuotation(quotation),
    canShare: canShareQuotation(quotation),
    allowedStatuses: ALLOWED_STATUS_TRANSITIONS[quotation.status] || [],
    latestDraftId,
  }
}
