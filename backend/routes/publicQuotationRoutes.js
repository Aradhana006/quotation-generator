import { Router } from 'express'
import * as publicQuotationController from '../controllers/publicQuotationController.js'
import { publicRateLimit } from '../middleware/publicRateLimit.js'

const router = Router()

router.get(
  '/:token',
  publicRateLimit({ windowMs: 60_000, max: 60 }),
  publicQuotationController.getPublicQuotation,
)
router.post(
  '/:token/accept',
  publicRateLimit({ windowMs: 60_000, max: 10 }),
  publicQuotationController.acceptPublicQuotation,
)
router.post(
  '/:token/reject',
  publicRateLimit({ windowMs: 60_000, max: 10 }),
  publicQuotationController.rejectPublicQuotation,
)
router.post(
  '/:token/request-changes',
  publicRateLimit({ windowMs: 60_000, max: 10 }),
  publicQuotationController.requestPublicChanges,
)

export default router
