import { Router } from 'express'
import * as quotationController from '../controllers/quotationController.js'

const router = Router()

router.get('/', quotationController.getQuotations)
router.get('/next-number', quotationController.getNextQuotationNumber)
router.get('/summary', quotationController.getQuotationSummary)
router.get('/:id/pdf', quotationController.downloadQuotationPdf)
router.get('/:id/history', quotationController.getQuotationHistory)
router.post('/:id/public-link', quotationController.createQuotationPublicLink)
router.get('/:id/public-link', quotationController.getQuotationPublicLink)
router.post('/:id/public-link/revoke', quotationController.revokeQuotationPublicLinks)
router.get('/:id/responses', quotationController.getQuotationResponses)
router.get('/:id', quotationController.getQuotationById)
router.post('/', quotationController.createQuotation)
router.put('/:id', quotationController.updateQuotation)
router.delete('/:id', quotationController.deleteQuotation)
router.post('/:id/duplicate', quotationController.duplicateQuotation)
router.post('/:id/revise', quotationController.reviseQuotation)
router.post('/:id/archive', quotationController.archiveQuotation)
router.post('/:id/restore', quotationController.restoreQuotation)
router.patch('/:id/status', quotationController.updateQuotationStatus)

export default router
