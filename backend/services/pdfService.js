import { getBuiltInTemplate } from '../utils/builtInTemplates.js'
import { getCustomTemplateById } from '../models/templateModel.js'
import { readStoredFileBuffer } from './storageService.js'
import { renderClassicPdf } from '../pdf/templates/classicPdf.js'
import { renderCustomPdf } from '../pdf/templates/customPdf.js'
import { renderModernPdf } from '../pdf/templates/modernPdf.js'
import { renderProfessionalPdf } from '../pdf/templates/professionalPdf.js'

function resolveBuiltInRenderer(templateId) {
  if (templateId === 'professional') return renderProfessionalPdf
  if (templateId === 'classic') return renderClassicPdf
  return renderModernPdf
}

export async function generateQuotationPdf(quotation, companyId) {
  const selected = quotation.selectedTemplate || { type: 'builtin', id: 'modern' }

  if (selected.type === 'custom') {
    let customTemplate = null
    let fileBuffer = null
    const templateId = typeof selected.id === 'string' ? selected.id : ''
    const looksLikeId = /^[0-9a-f-]{36}$/i.test(templateId)

    if (looksLikeId) {
      try {
        customTemplate = await getCustomTemplateById(templateId, companyId)
        if (customTemplate?.storagePath) {
          fileBuffer = await readStoredFileBuffer(customTemplate.storagePath)
        }
      } catch (error) {
        console.error('Custom template lookup failed:', error.message)
      }
    }

    return renderCustomPdf(quotation, { customTemplate, fileBuffer })
  }

  const builtIn = getBuiltInTemplate(selected.id)
  const renderer = resolveBuiltInRenderer(builtIn?.id || 'modern')
  return renderer(quotation)
}
