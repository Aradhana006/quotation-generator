/**
 * Quotation transaction service.
 *
 * Future: GET/POST/PUT/DELETE /api/quotations
 *         POST /api/quotations/:id/duplicate
 *         PATCH /api/quotations/:id/status
 */

import { STORAGE_KEYS } from '../data/defaults.js'
import { generateQuotationNumber } from '../utils/quotationNumber.js'
import { generateId, readStorage, writeStorage } from './storageAdapter.js'

function getAll() {
  return readStorage(STORAGE_KEYS.quotations, [])
}

function saveAll(quotations) {
  writeStorage(STORAGE_KEYS.quotations, quotations)
}

/** Normalize frontend shape for future API (quotationDetails → details) */
export function toApiQuotation(quotation) {
  const { quotationDetails, ...rest } = quotation
  return {
    ...rest,
    details: quotationDetails || quotation.details,
    quotationNumber:
      quotation.quotationNumber ||
      quotationDetails?.quotationNumber ||
      quotation.details?.quotationNumber,
  }
}

/** Normalize API response for frontend (details → quotationDetails) */
export function fromApiQuotation(quotation) {
  const { details, ...rest } = quotation
  return {
    ...rest,
    quotationDetails: details || quotation.quotationDetails,
  }
}

export function getQuotations() {
  // Future: return apiClient.get('/quotations').then(r => r.data.map(fromApiQuotation))
  return getAll()
}

export function getQuotationById(id) {
  // Future: return apiClient.get(`/quotations/${id}`).then(r => fromApiQuotation(r.data))
  return getAll().find((quotation) => quotation.id === id) || null
}

export function saveQuotation(quotationData) {
  // Future: POST or PUT via apiClient
  const now = new Date().toISOString()
  const quotation = {
    ...quotationData,
    updatedAt: now,
    createdAt: quotationData.createdAt || now,
  }

  const all = getAll()
  const exists = all.some((item) => item.id === quotation.id)
  const updated = exists
    ? all.map((item) => (item.id === quotation.id ? quotation : item))
    : [...all, quotation]

  saveAll(updated)
  return quotation
}

export function deleteQuotation(id) {
  // Future: return apiClient.delete(`/quotations/${id}`)
  saveAll(getAll().filter((quotation) => quotation.id !== id))
}

export function duplicateQuotation(id) {
  // Future: return apiClient.post(`/quotations/${id}/duplicate`)
  const original = getQuotationById(id)
  if (!original) return null

  const duplicate = JSON.parse(JSON.stringify(original))
  duplicate.id = generateId()
  duplicate.quotationNumber = generateQuotationNumber(getAll())
  if (duplicate.quotationDetails) {
    duplicate.quotationDetails.quotationNumber = duplicate.quotationNumber
  }
  duplicate.status = 'draft'
  duplicate.createdAt = new Date().toISOString()
  duplicate.updatedAt = duplicate.createdAt

  saveAll([...getAll(), duplicate])
  return duplicate
}

export function updateQuotationStatus(id, status) {
  // Future: return apiClient.patch(`/quotations/${id}/status`, { status })
  const updated = getAll().map((quotation) =>
    quotation.id === id
      ? { ...quotation, status, updatedAt: new Date().toISOString() }
      : quotation,
  )
  saveAll(updated)
}

export function generateNextQuotationNumber(excludeId = null) {
  return generateQuotationNumber(getAll(), excludeId)
}

export { generateQuotationNumber }
