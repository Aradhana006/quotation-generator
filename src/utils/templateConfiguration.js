import { DEFAULT_ITEM_TABLE_COLUMNS, getTemplateFieldDefinition } from '../data/templateFields'

export function createEmptyTemplateConfiguration() {
  return {
    version: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pageCount: 1,
    pages: [{ page: 1, fields: [] }],
  }
}

export function normalizeTemplateConfiguration(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const incomingPages = Array.isArray(source.pages) ? source.pages : []
  const highestPage = incomingPages.reduce((max, page) => Math.max(max, Number(page.page) || 0), 0)
  const pageCount = Math.max(1, Number(source.pageCount) || highestPage || 1)

  const pages = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1
    const existing = incomingPages.find((page) => Number(page.page) === pageNumber)
    return {
      page: pageNumber,
      fields: Array.isArray(existing?.fields) ? existing.fields.map((field) => ({ ...field })) : [],
    }
  })

  return {
    version: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pageCount,
    pages,
  }
}

export function createMappedField(fieldKey, page, offset = 0) {
  const definition = getTemplateFieldDefinition(fieldKey)
  const field = {
    id: crypto.randomUUID(),
    field: fieldKey,
    page,
    x: 48 + offset,
    y: 64 + offset,
    width: definition.defaultWidth || 180,
    height: definition.defaultHeight || 22,
    fontSize: definition.defaultFontSize || 11,
    fontWeight: definition.defaultFontWeight || 'normal',
    alignment: 'left',
    color: '#111827',
    visibility: definition.defaultVisibility || 'always',
  }

  if (fieldKey === 'items.table') {
    field.columns = DEFAULT_ITEM_TABLE_COLUMNS.map((column) => ({ ...column }))
  }

  return field
}

export function upsertPageFields(configuration, pageNumber, updater) {
  const next = normalizeTemplateConfiguration(configuration)
  next.pages = next.pages.map((page) => {
    if (page.page !== pageNumber) return page
    return { ...page, fields: updater(page.fields) }
  })
  return next
}

export function setConfigurationPageCount(configuration, pageCount) {
  const safeCount = Math.min(20, Math.max(1, Number(pageCount) || 1))
  const next = normalizeTemplateConfiguration({ ...configuration, pageCount: safeCount })
  next.pageCount = safeCount
  next.pages = Array.from({ length: safeCount }, (_, index) => {
    const pageNumber = index + 1
    return next.pages.find((page) => page.page === pageNumber) || { page: pageNumber, fields: [] }
  })
  return next
}

export function getPageFields(configuration, pageNumber) {
  return configuration.pages?.find((page) => page.page === pageNumber)?.fields || []
}

export function findMappedField(configuration, fieldId) {
  for (const page of configuration.pages || []) {
    const match = page.fields.find((field) => field.id === fieldId)
    if (match) return match
  }
  return null
}
