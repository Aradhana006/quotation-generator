import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function getDefaultTermsLibrary() {
  return apiClient.get(API_ENDPOINTS.terms)
}

export async function saveDefaultTermsLibrary(terms) {
  return apiClient.put(API_ENDPOINTS.terms, { terms })
}
