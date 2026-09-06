/**
 * Placeholder HTTP client for future API integration.
 * Currently NOT used — services read/write localStorage directly.
 *
 * When backend is ready, replace service internals to call:
 *   apiClient.get('/quotations')
 *   apiClient.post('/quotations', body)
 * etc.
 */

import { API_BASE_URL } from '../config/api.js'
import { createErrorResponse, createSuccessResponse } from './apiResponse.js'

async function request(method, path, body = null) {
  // TODO: Phase 8+ — implement real fetch with auth headers
  throw new Error(
    `API not implemented yet: ${method} ${API_BASE_URL}${path}. ` +
      'Services still use localStorage.',
  )
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}

export { createSuccessResponse, createErrorResponse }
