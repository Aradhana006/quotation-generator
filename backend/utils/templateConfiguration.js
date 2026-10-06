import crypto from 'crypto'
import {
  ALLOWED_ITEM_TABLE_COLUMNS,
  DEFAULT_ITEM_TABLE_COLUMNS,
  isAllowedTemplateField,
} from './templateFields.js'

const ALIGNMENTS = new Set(['left', 'center', 'right'])
const FONT_WEIGHTS = new Set(['normal', 'bold'])
const VISIBILITY = new Set(['always', 'conditional'])
const PAGE_SIZES = new Set(['A4'])
const ORIENTATIONS = new Set(['portrait'])
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const MAX_PAGES = 20
const MAX_FIELDS_PER_PAGE = 80

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function inRange(value, min, max) {
  return isNumber(value) && value >= min && value <= max
}

export function createEmptyTemplateConfiguration() {
  return {
    version: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pageCount: 1,
    pages: [{ page: 1, fields: [] }],
  }
}

function normalizeColumns(columns) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return DEFAULT_ITEM_TABLE_COLUMNS.map((column) => ({ ...column }))
  }

  return columns.slice(0, 10).map((column, index) => {
    const key = ALLOWED_ITEM_TABLE_COLUMNS.includes(column?.key)
      ? column.key
      : 'description'
    return {
      key,
      label: typeof column?.label === 'string' && column.label.trim()
        ? column.label.trim().slice(0, 40)
        : key,
      width: inRange(Number(column?.width), 20, 500) ? Number(column.width) : 80,
      order: index,
    }
  })
}

function normalizeField(field, pageNumber) {
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    return { error: 'Each mapped field must be an object.' }
  }

  if (!isAllowedTemplateField(field.field)) {
    return { error: `Unsupported field: ${field.field || '(missing)'}.` }
  }

  if (!inRange(Number(field.x), -20, 700) || !inRange(Number(field.y), -20, 1000)) {
    return { error: `Field "${field.field}" has an invalid position.` }
  }

  if (!inRange(Number(field.width), 8, 600) || !inRange(Number(field.height), 8, 840)) {
    return { error: `Field "${field.field}" has an invalid size.` }
  }

  if (!inRange(Number(field.fontSize ?? 12), 6, 48)) {
    return { error: `Field "${field.field}" has an invalid font size.` }
  }

  const alignment = field.alignment || 'left'
  if (!ALIGNMENTS.has(alignment)) {
    return { error: `Field "${field.field}" has an invalid alignment.` }
  }

  const fontWeight = field.fontWeight || 'normal'
  if (!FONT_WEIGHTS.has(fontWeight)) {
    return { error: `Field "${field.field}" has an invalid font weight.` }
  }

  const color = field.color || '#000000'
  if (!COLOR_PATTERN.test(color)) {
    return { error: `Field "${field.field}" has an invalid color.` }
  }

  const visibility = field.visibility || 'always'
  if (!VISIBILITY.has(visibility)) {
    return { error: `Field "${field.field}" has an invalid visibility value.` }
  }

  const page = Number(field.page ?? pageNumber)
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGES) {
    return { error: `Field "${field.field}" has an invalid page number.` }
  }

  const normalized = {
    id: typeof field.id === 'string' && field.id.trim() ? field.id.trim().slice(0, 80) : crypto.randomUUID(),
    field: field.field,
    page,
    x: Number(field.x),
    y: Number(field.y),
    width: Number(field.width),
    height: Number(field.height),
    fontSize: Number(field.fontSize ?? 12),
    fontWeight,
    alignment,
    color,
    visibility,
  }

  if (field.field === 'items.table') {
    normalized.columns = normalizeColumns(field.columns)
  }

  return { field: normalized }
}

export function validateTemplateConfiguration(input) {
  let config = input
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config)
    } catch {
      return { error: 'Template configuration must be valid JSON.' }
    }
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { error: 'Template configuration must be an object.' }
  }

  const pageSize = config.pageSize || 'A4'
  const orientation = config.orientation || 'portrait'
  if (!PAGE_SIZES.has(pageSize)) {
    return { error: 'Only A4 page size is supported.' }
  }
  if (!ORIENTATIONS.has(orientation)) {
    return { error: 'Only portrait orientation is supported.' }
  }

  let pageCount = Number(config.pageCount || config.pages?.length || 1)
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGES) {
    return { error: 'Page count must be an integer between 1 and 20.' }
  }

  if (config.pages !== undefined && !Array.isArray(config.pages)) {
    return { error: 'configuration.pages must be an array.' }
  }

  const sourcePages = Array.isArray(config.pages) ? config.pages : []
  const pagesByNumber = new Map()

  for (const page of sourcePages) {
    if (!page || typeof page !== 'object' || Array.isArray(page)) {
      return { error: 'Each page must be an object.' }
    }

    const pageNumber = Number(page.page)
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > MAX_PAGES) {
      return { error: 'Each page must have a valid page number.' }
    }

    if (!Array.isArray(page.fields)) {
      return { error: `Page ${pageNumber} fields must be an array.` }
    }

    if (page.fields.length > MAX_FIELDS_PER_PAGE) {
      return { error: `Page ${pageNumber} has too many fields.` }
    }

    const fields = []
    const seenIds = new Set()
    for (const rawField of page.fields) {
      const result = normalizeField(rawField, pageNumber)
      if (result.error) return { error: result.error }
      if (seenIds.has(result.field.id)) {
        return { error: 'Mapped fields must have unique ids.' }
      }
      seenIds.add(result.field.id)
      result.field.page = pageNumber
      fields.push(result.field)
    }

    pagesByNumber.set(pageNumber, { page: pageNumber, fields })
    if (pageNumber > pageCount) pageCount = pageNumber
  }

  const pages = []
  for (let index = 1; index <= pageCount; index += 1) {
    pages.push(pagesByNumber.get(index) || { page: index, fields: [] })
  }

  return {
    configuration: {
      version: 1,
      pageSize,
      orientation,
      pageCount,
      pages,
    },
  }
}
