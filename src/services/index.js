/**
 * Service layer entry point.
 *
 * React components and contexts should eventually call these services
 * instead of reading/writing localStorage directly.
 *
 * When the backend is ready, only the internals of these files change.
 * Component code stays the same.
 */

export * as companyService from './companyService.js'
export * as customerService from './customerService.js'
export * as productService from './productService.js'
export * as templateService from './templateService.js'
export * as termService from './termService.js'
export * as quotationService from './quotationService.js'
export { apiClient } from './apiClient.js'
export { createSuccessResponse, createErrorResponse, ERROR_CODES } from './apiResponse.js'
