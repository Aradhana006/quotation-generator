import { Router } from 'express'
import * as customerController from '../controllers/customerController.js'

const router = Router()

router.get('/', customerController.getCustomers)
router.get('/:id', customerController.getCustomerById)
router.post('/', customerController.createCustomer)
router.put('/:id', customerController.updateCustomer)
router.delete('/:id', customerController.deleteCustomer)

export default router
