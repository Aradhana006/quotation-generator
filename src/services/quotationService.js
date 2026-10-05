/**
 * Quotation transaction service.
 * React → this file → Express → PostgreSQL
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api.js'
import { ApiError, apiClient } from './apiClient.js'

function parseContentDispositionFilename(header, fallback) {
  if (!header) return fallback
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1])
    } catch {
      return fallback
    }
  }
  const plainMatch = header.match(/filename="?([^"]+)"?/i)
  return plainMatch?.[1] || fallback
}

function triggerBrowserDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

function toQuery(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getQuotations(filters = {}) {
  const result = await apiClient.getFull(`${API_ENDPOINTS.quotations}${toQuery(filters)}`)
  return {
    items: result.data || [],
    pagination: result.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  }
}

export async function getQuotationSummary() {
  return apiClient.get(`${API_ENDPOINTS.quotations}/summary`)
}

export async function getQuotation(id) {
  return apiClient.get(`${API_ENDPOINTS.quotations}/${id}`)
}

export async function getQuotationById(id) {
  return getQuotation(id)
}

export async function createQuotation(quotation) {
  return apiClient.post(API_ENDPOINTS.quotations, quotation)
}

export async function updateQuotation(id, quotation) {
  return apiClient.put(`${API_ENDPOINTS.quotations}/${id}`, quotation)
}

export async function deleteQuotation(id) {
  return apiClient.delete(`${API_ENDPOINTS.quotations}/${id}`)
}

export async function duplicateQuotation(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/duplicate`)
}

export async function updateQuotationStatus(id, status) {
  return apiClient.patch(`${API_ENDPOINTS.quotations}/${id}/status`, { status })
}

export async function reviseQuotation(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/revise`)
}

export async function getQuotationHistory(id) {
  return apiClient.get(`${API_ENDPOINTS.quotations}/${id}/history`)
}

export async function archiveQuotation(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/archive`)
}

export async function restoreQuotation(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/restore`)
}

export async function generateNextQuotationNumber(excludeId = null) {
  const query = excludeId ? `?excludeId=${excludeId}` : ''
  const data = await apiClient.get(`${API_ENDPOINTS.quotations}/next-number${query}`)
  return data.quotationNumber
}

export async function createPublicLink(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/public-link`)
}

export async function getPublicLink(id) {
  return apiClient.get(`${API_ENDPOINTS.quotations}/${id}/public-link`)
}

export async function revokePublicLinks(id) {
  return apiClient.post(`${API_ENDPOINTS.quotations}/${id}/public-link/revoke`)
}

export async function getQuotationResponses(id) {
  return apiClient.get(`${API_ENDPOINTS.quotations}/${id}/responses`)
}

export async function downloadQuotationPdf(id) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.quotations}/${id}/pdf`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch {
    throw new ApiError(
      'Unable to reach the API server. Is the backend running?',
      'NETWORK_ERROR',
      0,
    )
  }

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('application/pdf')) {
    let message = 'Unable to generate PDF.'
    try {
      const json = await response.json()
      message = json.error?.message || message
    } catch {
      // Keep the generic message when the server did not return JSON.
    }
    throw new ApiError(message, 'PDF_GENERATION_FAILED', response.status)
  }

  const blob = await response.blob()
  const filename = parseContentDispositionFilename(
    response.headers.get('content-disposition'),
    'quotation.pdf',
  )
  triggerBrowserDownload(blob, filename)
  return filename
}
