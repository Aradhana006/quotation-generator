/**
 * Template service — custom templates only (built-in templates are code-defined).
 *
 * Future: GET/POST/PUT/DELETE /api/templates
 */

import { STORAGE_KEYS } from '../data/defaults.js'
import { readStorage, writeStorage } from './storageAdapter.js'

function getAll() {
  return readStorage(STORAGE_KEYS.customTemplates, [])
}

function saveAll(templates) {
  writeStorage(STORAGE_KEYS.customTemplates, templates)
}

export function getCustomTemplates() {
  // Future: return apiClient.get('/templates')
  return getAll()
}

export function getCustomTemplateById(id) {
  // Future: return apiClient.get(`/templates/${id}`)
  return getAll().find((template) => template.id === id) || null
}

export function createCustomTemplate(template) {
  // Future: return apiClient.post('/templates', template)
  saveAll([...getAll(), template])
  return template
}

export function deleteCustomTemplate(id) {
  // Future: return apiClient.delete(`/templates/${id}`)
  saveAll(getAll().filter((template) => template.id !== id))
}

export function saveCustomTemplates(templates) {
  saveAll(templates)
}
