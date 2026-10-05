/**
 * Template service.
 * Built-in templates come from the API as metadata only.
 * Custom templates are uploaded as multipart/form-data (not JSON)
 * so the binary file can travel with the name field.
 */

import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function getTemplates() {
  return apiClient.get(API_ENDPOINTS.templates)
}

export async function getTemplate(id) {
  return apiClient.get(`${API_ENDPOINTS.templates}/${id}`)
}

export async function createTemplate(name, file, onProgress) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('file', file)
  return apiClient.postForm(API_ENDPOINTS.templates, formData, onProgress)
}

export async function updateTemplate(id, { name, file }, onProgress) {
  const formData = new FormData()
  if (name) formData.append('name', name)
  if (file) formData.append('file', file)
  return apiClient.putForm(`${API_ENDPOINTS.templates}/${id}`, formData, onProgress)
}

export async function updateTemplateConfiguration(id, configuration) {
  return apiClient.put(`${API_ENDPOINTS.templates}/${id}`, { configuration })
}

export async function deleteTemplate(id) {
  return apiClient.delete(`${API_ENDPOINTS.templates}/${id}`)
}
