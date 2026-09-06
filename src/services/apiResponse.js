/**
 * Standard API response shapes for frontend/backend contract.
 *
 * Success:
 *   { success: true, data: T, message?: string }
 *
 * Error:
 *   { success: false, error: { code: string, message: string, details?: object } }
 */

export function createSuccessResponse(data, message = '') {
  return { success: true, data, message }
}

export function createErrorResponse(code, message, details = null) {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  }
}

/** Common error codes the frontend should handle consistently */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}
