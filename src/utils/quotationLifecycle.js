export const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['accepted', 'rejected', 'expired', 'cancelled'],
  accepted: [],
  rejected: ['cancelled'],
  expired: ['cancelled'],
  cancelled: [],
}

export function canEditQuotation(quotation) {
  return quotation?.permissions?.canEdit ?? (quotation?.status === 'draft' && !quotation?.archivedAt)
}

export function canReviseQuotation(quotation) {
  return quotation?.permissions?.canRevise ?? false
}

export function canShareQuotation(quotation) {
  return quotation?.permissions?.canShare ?? false
}
