/**
 * Company profile service.
 *
 * Future: GET /api/company, PUT /api/company
 */

import { EMPTY_COMPANY_PROFILE } from '../data/defaults.js'
import { STORAGE_KEYS } from '../data/defaults.js'
import { readStorage, writeStorage } from './storageAdapter.js'

export function getCompanyProfile() {
  // Future: return apiClient.get('/company')
  return readStorage(STORAGE_KEYS.companyProfile, EMPTY_COMPANY_PROFILE)
}

export function saveCompanyProfile(profile) {
  // Future: return apiClient.put('/company', profile)
  writeStorage(STORAGE_KEYS.companyProfile, profile)
  return profile
}

export function updateCompanyProfile(updater) {
  const current = getCompanyProfile()
  const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
  return saveCompanyProfile(updated)
}
