import { Router } from 'express'
import * as termController from '../controllers/termController.js'

const router = Router()

router.get('/', termController.getDefaultTerms)
router.put('/', termController.saveDefaultTerms)

export default router
