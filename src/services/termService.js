/**
 * Default terms library service (master data).
 *
 * Future: GET/POST/PUT/DELETE /api/terms
 */

import { STORAGE_KEYS } from '../data/defaults.js'
import { DEFAULT_TERMS_LIBRARY } from '../utils/quotationCalculations.js'
import { readStorage, writeStorage } from './storageAdapter.js'

export function getDefaultTermsLibrary() {
  // Future: return apiClient.get('/terms')
  return readStorage(STORAGE_KEYS.defaultTermsLibrary, DEFAULT_TERMS_LIBRARY)
}

export function saveDefaultTermsLibrary(terms) {
  // Future: return apiClient.put('/terms', { terms })
  writeStorage(STORAGE_KEYS.defaultTermsLibrary, terms)
  return terms
}
