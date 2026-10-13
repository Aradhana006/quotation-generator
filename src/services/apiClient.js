/**
 * HTTP client for backend API calls.
 *
 * We use fetch (built into browsers) instead of axios because:
 * - No extra dependency needed
 * - Works natively in modern browsers
 * - Sufficient for our REST JSON API
 */

import { API_BASE_URL } from '../config/api.js'

export class ApiError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', status = 500) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

let unauthorizedHandler = null

/** Register a callback when a protected API call returns 401. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null
}

function shouldHandleUnauthorized(path) {
  return !String(path || '').startsWith('/auth/')
}

export function notifyUnauthorized(path = '', code = 'UNAUTHORIZED') {
  if (code !== 'UNAUTHORIZED' || !shouldHandleUnauthorized(path)) return
  unauthorizedHandler?.()
}

async function request(method, path, body = null, { full = false } = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body !== null && body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const url = `${API_BASE_URL}${path}`
  let response
  try {
    response = await fetch(url, options)
  } catch {
    // One retry helps when Render free tier is waking from sleep.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      response = await fetch(url, options)
    } catch {
      throw new ApiError(
        'Unable to reach the API server. Wait 30s if the backend is waking up, then try again.',
        'NETWORK_ERROR',
        0,
      )
    }
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Invalid response from server.', 'INTERNAL_ERROR', response.status)
  }

  if (!response.ok || json.success === false) {
    const code = json.error?.code || 'INTERNAL_ERROR'
    if (response.status === 401) {
      notifyUnauthorized(path, code)
    }
    throw new ApiError(
      json.error?.message || 'Request failed.',
      code,
      response.status,
    )
  }

  if (full) {
    return {
      data: json.data,
      pagination: json.pagination || null,
      message: json.message,
    }
  }

  return json.data
}

function requestForm(method, path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${API_BASE_URL}${path}`)
    xhr.withCredentials = true

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
    }

    xhr.onload = () => {
      let json
      try {
        json = JSON.parse(xhr.responseText)
      } catch {
        reject(new ApiError('Invalid response from server.', 'INTERNAL_ERROR', xhr.status))
        return
      }

      if (xhr.status >= 400 || json.success === false) {
        const code = json.error?.code || 'INTERNAL_ERROR'
        if (xhr.status === 401) {
          notifyUnauthorized(path, code)
        }
        reject(
          new ApiError(
            json.error?.message || 'Request failed.',
            code,
            xhr.status,
          ),
        )
        return
      }

      resolve(json.data)
    }

    xhr.onerror = () => {
      reject(
        new ApiError(
          'Unable to reach the API server. Is the backend running?',
          'NETWORK_ERROR',
          0,
        ),
      )
    }

    xhr.send(formData)
  })
}

export const apiClient = {
  get: (path) => request('GET', path),
  getFull: (path) => request('GET', path, null, { full: true }),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  postForm: (path, formData, onProgress) => requestForm('POST', path, formData, onProgress),
  putForm: (path, formData, onProgress) => requestForm('PUT', path, formData, onProgress),
}
