import { Router } from 'express'
import multer from 'multer'
import * as templateController from '../controllers/templateController.js'
import { MAX_TEMPLATE_FILE_SIZE } from '../utils/fileValidation.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_TEMPLATE_FILE_SIZE },
})

const router = Router()

function handleMulter(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) return next()
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File too large.' },
      })
    }
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Upload failed.' },
    })
  })
}

function maybeUpload(req, res, next) {
  const contentType = req.headers['content-type'] || ''
  if (contentType.includes('multipart/form-data')) {
    return handleMulter(req, res, next)
  }
  return next()
}

router.get('/', templateController.getTemplates)
router.get('/:id', templateController.getTemplateById)
router.post('/', handleMulter, templateController.createTemplate)
router.put('/:id', maybeUpload, templateController.updateTemplate)
router.delete('/:id', templateController.deleteTemplate)

export default router
