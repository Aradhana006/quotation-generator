import crypto from 'crypto'
import fs from 'fs'
import * as templateModel from '../models/templateModel.js'
import {
  createFileAccessUrl,
  deleteTemplateFile,
  getStorageDriverLabel,
  resolveLocalFilePath,
  uploadTemplateFile,
  verifyLocalFileToken,
} from '../services/storageService.js'
import {
  getBuiltInTemplate,
  mapBuiltInTemplate,
  BUILT_IN_TEMPLATES,
} from '../utils/builtInTemplates.js'
import { isPreviewable, validateTemplateFile } from '../utils/fileValidation.js'
import { validateTemplateConfiguration } from '../utils/templateConfiguration.js'
import { errorResponse, successResponse } from '../utils/response.js'

function toPublicTemplate(template) {
  if (!template) return null
  return {
    id: template.id,
    type: template.type,
    name: template.name,
    description: template.description || undefined,
    fileUrl: template.fileUrl || null,
    fileName: template.fileName || null,
    fileType: template.fileType || null,
    fileSize: template.fileSize || 0,
    previewUrl: template.previewUrl || null,
    configuration: template.configuration || {},
    createdAt: template.createdAt || null,
    updatedAt: template.updatedAt || null,
  }
}

export async function getTemplates(req, res) {
  try {
    const custom = await templateModel.getCustomTemplates(req.companyId)
    const templates = [
      ...BUILT_IN_TEMPLATES.map(mapBuiltInTemplate),
      ...custom.map(toPublicTemplate),
    ]
    return successResponse(res, templates, 'Templates loaded.')
  } catch (error) {
    console.error('getTemplates error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load templates.', 500)
  }
}

export async function getTemplateById(req, res) {
  try {
    const builtIn = getBuiltInTemplate(req.params.id)
    if (builtIn) {
      return successResponse(res, mapBuiltInTemplate(builtIn), 'Template loaded.')
    }

    const template = await templateModel.getCustomTemplateById(req.params.id, req.companyId)
    if (!template) {
      return errorResponse(res, 'NOT_FOUND', 'Template not found.', 404)
    }
    return successResponse(res, toPublicTemplate(template), 'Template loaded.')
  } catch (error) {
    console.error('getTemplateById error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load template.', 500)
  }
}

export async function createTemplate(req, res) {
  try {
    const name = req.body?.name?.trim()
    if (!name) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Template name is required.', 400)
    }

    const validation = validateTemplateFile(req.file)
    if (validation.error) {
      return errorResponse(res, 'VALIDATION_ERROR', validation.error, 400)
    }

    const templateId = crypto.randomUUID()
    const uploaded = await uploadTemplateFile({
      companyId: req.companyId,
      templateId,
      fileName: validation.fileName,
      buffer: req.file.buffer,
      contentType: validation.fileType,
    })

    try {
      const template = await templateModel.createCustomTemplate(
        {
          id: templateId,
          name,
          storagePath: uploaded.storagePath,
          fileName: validation.fileName,
          fileType: validation.fileType,
          fileSize: validation.fileSize,
        },
        req.companyId,
      )
      return successResponse(res, toPublicTemplate(template), 'Template uploaded.', 201)
    } catch (error) {
      await deleteTemplateFile(uploaded.storagePath).catch(() => {})
      throw error
    }
  } catch (error) {
    console.error('createTemplate error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Upload failed.', 500)
  }
}

export async function updateTemplate(req, res) {
  try {
    const existing = await templateModel.getCustomTemplateById(req.params.id, req.companyId)
    if (!existing) {
      return errorResponse(res, 'NOT_FOUND', 'Template not found.', 404)
    }

    const name = req.body?.name?.trim()
    if (req.body?.name !== undefined && !name) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Template name is required.', 400)
    }

    let configuration
    if (req.body?.configuration !== undefined) {
      const validated = validateTemplateConfiguration(req.body.configuration)
      if (validated.error) {
        return errorResponse(res, 'VALIDATION_ERROR', validated.error, 400)
      }
      configuration = validated.configuration
    }

    let fileFields = {}
    let uploadedPath = null

    if (req.file) {
      const validation = validateTemplateFile(req.file)
      if (validation.error) {
        return errorResponse(res, 'VALIDATION_ERROR', validation.error, 400)
      }

      const uploaded = await uploadTemplateFile({
        companyId: req.companyId,
        templateId: existing.id,
        fileName: validation.fileName,
        buffer: req.file.buffer,
        contentType: validation.fileType,
      })
      uploadedPath = uploaded.storagePath
      fileFields = {
        storagePath: uploaded.storagePath,
        fileName: validation.fileName,
        fileType: validation.fileType,
        fileSize: validation.fileSize,
      }
    }

    const template = await templateModel.updateCustomTemplate(
      req.params.id,
      { name, configuration, ...fileFields },
      req.companyId,
    )

    if (uploadedPath && existing.storagePath && existing.storagePath !== uploadedPath) {
      await deleteTemplateFile(existing.storagePath).catch((error) => {
        console.error('Old template file cleanup failed:', error.message)
      })
    }

    return successResponse(res, toPublicTemplate(template), 'Template updated.')
  } catch (error) {
    console.error('updateTemplate error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to update template.', 500)
  }
}

export async function deleteTemplate(req, res) {
  try {
    const existing = await templateModel.getCustomTemplateById(req.params.id, req.companyId)
    if (!existing) {
      return errorResponse(res, 'NOT_FOUND', 'Template not found.', 404)
    }

    const deleted = await templateModel.deleteCustomTemplate(req.params.id, req.companyId)
    if (!deleted) {
      return errorResponse(res, 'NOT_FOUND', 'Template not found.', 404)
    }

    if (deleted.storage_path) {
      try {
        await deleteTemplateFile(deleted.storage_path)
      } catch (error) {
        console.error('Template metadata deleted; file cleanup failed:', error.message)
      }
    }

    return successResponse(res, { id: req.params.id }, 'Template deleted.')
  } catch (error) {
    console.error('deleteTemplate error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to delete template.', 500)
  }
}

export async function serveTemplateFile(req, res) {
  try {
    const { path: storagePath, exp, sig } = req.query
    if (!verifyLocalFileToken(storagePath, exp, sig)) {
      return errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired file link.', 401)
    }

    const absolute = resolveLocalFilePath(storagePath)
    if (!absolute || !fs.existsSync(absolute)) {
      return errorResponse(res, 'NOT_FOUND', 'File not found.', 404)
    }

    return res.sendFile(absolute)
  } catch (error) {
    console.error('serveTemplateFile error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load file.', 500)
  }
}

export function logStorageDriver() {
  console.log(`Template file storage: ${getStorageDriverLabel()}.`)
}

export { isPreviewable, createFileAccessUrl }
