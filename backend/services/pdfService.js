import { getBuiltInTemplate } from '../utils/builtInTemplates.js'
import { getCompanyById } from '../models/companyModel.js'
import { getCustomTemplateById } from '../models/templateModel.js'
import { isPdfDrawableImage } from '../pdf/format.js'
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

/**
 * Prefer quotation snapshot images; fall back to company profile when the
 * snapshot is missing or not PDF-drawable (e.g. SVG/PDF uploads).
 */
async function enrichQuotationImages(quotation, companyId) {
  const companyLogoOk = isPdfDrawableImage(quotation?.company?.logo)
  const signatureOk = isPdfDrawableImage(quotation?.signature?.signatureImage)
  if (companyLogoOk && signatureOk) return quotation

  let profile = null
  try {
    profile = await getCompanyById(companyId)
  } catch (error) {
    console.warn('Unable to load company profile for PDF images:', error.message)
    return quotation
  }
  if (!profile) return quotation

  const next = {
    ...quotation,
    company: { ...(quotation.company || {}) },
    signature: { ...(quotation.signature || {}) },
  }

  if (!companyLogoOk && isPdfDrawableImage(profile.logo)) {
    next.company.logo = profile.logo
  }
  if (!signatureOk && isPdfDrawableImage(profile.signatory?.signature)) {
    next.signature.signatureImage = profile.signatory.signature
  }
  if (!next.signature.name && profile.signatory?.name) {
    next.signature.name = profile.signatory.name
  }
  if (!next.signature.designation && profile.signatory?.designation) {
    next.signature.designation = profile.signatory.designation
  }

  return next
}

export async function generateQuotationPdf(quotation, companyId) {
  const selected = quotation.selectedTemplate || { type: 'builtin', id: 'modern' }
  const enriched = await enrichQuotationImages(quotation, companyId)

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

    return renderCustomPdf(enriched, { customTemplate, fileBuffer })
  }

  const builtIn = getBuiltInTemplate(selected.id)
  const renderer = resolveBuiltInRenderer(builtIn?.id || 'modern')
  return renderer(enriched)
}
