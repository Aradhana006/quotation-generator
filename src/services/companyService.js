import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function getCompanyProfile() {
  return apiClient.get(API_ENDPOINTS.company)
}

export async function saveCompanyProfile(profile) {
  return apiClient.put(API_ENDPOINTS.company, profile)
}
