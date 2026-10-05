import { errorResponse } from '../utils/response.js'

/**
 * Ensures the request belongs to an authenticated user.
 * Sets req.userId and req.companyId from the server-side session.
 * NEVER trust company_id from the request body or query string.
 */
export function requireAuth(req, res, next) {
  if (!req.session?.userId || !req.session?.companyId) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication required.', 401)
  }

  req.userId = req.session.userId
  req.companyId = req.session.companyId
  return next()
}
