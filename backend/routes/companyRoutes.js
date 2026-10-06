import { Router } from 'express'
import * as companyController from '../controllers/companyController.js'

const router = Router()

router.get('/', companyController.getCompanyProfile)
router.put('/', companyController.updateCompanyProfile)

export default router
