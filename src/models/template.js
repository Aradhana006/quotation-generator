/**
 * Built-in templates are code-defined (not stored in DB per company).
 *
 * @typedef {Object} BuiltinTemplate
 * @property {'builtin'} type
 * @property {string} id - 'modern' | 'professional' | 'classic'
 * @property {string} name
 * @property {string} description
 */

export const BUILTIN_TEMPLATE_SHAPE = {
  type: 'builtin',
  id: '',
  name: '',
  description: '',
}

/**
 * Custom uploaded templates (master data, per company).
 *
 * @typedef {Object} CustomTemplate
 * @property {string} id
 * @property {'custom'} type
 * @property {string} name
 * @property {string} fileName
 * @property {string} fileType
 * @property {string} fileUrl - future: S3/cloud storage URL
 * @property {string} previewUrl
 * @property {Object|null} fieldMapping - future: maps quotation fields to template slots
 * @property {string} companyId
 * @property {string} createdAt
 */

export const CUSTOM_TEMPLATE_SHAPE = {
  id: '',
  type: 'custom',
  name: '',
  fileName: '',
  fileType: '',
  fileUrl: '',
  previewUrl: '',
  fieldMapping: null,
  companyId: '',
  createdAt: '',
}

/**
 * Template reference stored inside a quotation (snapshot pointer).
 *
 * @typedef {Object} TemplateSelection
 * @property {'builtin'|'custom'} type
 * @property {string} id
 */

export const TEMPLATE_SELECTION_SHAPE = {
  type: 'builtin',
  id: 'modern',
}
