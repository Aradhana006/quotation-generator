import { API_BASE_URL } from '../config/api.js'
import { ApiError } from './apiClient.js'

async function publicRequest(method, path, body = null) {
  const options = {
    method,
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new ApiError(
      'Unable to reach the quotation. Please try again.',
      'NETWORK_ERROR',
      0,
    )
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Unable to load quotation.', 'INTERNAL_ERROR', response.status)
  }

  if (!response.ok || json.success === false) {
    throw new ApiError(
      json.error?.message || 'Unable to load quotation.',
      json.error?.code || 'INTERNAL_ERROR',
      response.status,
    )
  }

  return {
    data: json.data,
    message: json.message,
  }
}

export async function getPublicQuotation(token) {
  const result = await publicRequest('GET', `/public/quotations/${token}`)
  return result.data
}

export async function acceptPublicQuotation(token, payload) {
  return publicRequest('POST', `/public/quotations/${token}/accept`, payload)
}

export async function rejectPublicQuotation(token, payload) {
  return publicRequest('POST', `/public/quotations/${token}/reject`, payload)
}

export async function requestPublicChanges(token, payload) {
  return publicRequest('POST', `/public/quotations/${token}/request-changes`, payload)
}

export function toCustomerQuotationData(publicQuotation) {
  return {
    status: publicQuotation.status,
    company: publicQuotation.company,
    customer: publicQuotation.customer,
    quotationDetails: {
      ...(publicQuotation.quotationDetails || {}),
      quotationNumber: publicQuotation.quotationNumber,
      quotationDate: publicQuotation.date,
      validUntil: publicQuotation.validUntil,
    },
    coverLetter: publicQuotation.coverLetter,
    items: publicQuotation.items || [],
    additionalCharges: publicQuotation.additionalCharges || [],
    notes: publicQuotation.notes || '',
    paymentTerms: publicQuotation.paymentTerms || '',
    deliveryTerms: publicQuotation.deliveryTerms || '',
    terms: publicQuotation.terms || [],
    bankDetails: publicQuotation.bankDetails || {},
    signature: publicQuotation.signature || {},
  }
}
