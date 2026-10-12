import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function register(payload) {
  return apiClient.post(API_ENDPOINTS.auth.register, {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    companyName: payload.companyName,
    website: payload.website || '',
    fax: payload.fax || '',
    formStartedAt: payload.formStartedAt || null,
  })
}

export async function login(payload) {
  return apiClient.post(API_ENDPOINTS.auth.login, {
    email: payload.email,
    password: payload.password,
    website: payload.website || '',
    fax: payload.fax || '',
    formStartedAt: payload.formStartedAt || null,
  })
}

export async function logout() {
  return apiClient.post(API_ENDPOINTS.auth.logout)
}

export async function getCurrentUser() {
  return apiClient.get(API_ENDPOINTS.auth.me)
}

export async function forgotPassword(payload) {
  return apiClient.post(API_ENDPOINTS.auth.forgotPassword, {
    email: payload.email,
    website: payload.website || '',
    fax: payload.fax || '',
  })
}

export async function validateResetToken(token) {
  return apiClient.get(API_ENDPOINTS.auth.validateResetToken(token))
}

export async function resetPassword(payload) {
  return apiClient.post(API_ENDPOINTS.auth.resetPassword, {
    token: payload.token,
    password: payload.password,
    website: payload.website || '',
    fax: payload.fax || '',
  })
}
