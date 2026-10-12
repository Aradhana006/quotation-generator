import { Router } from 'express'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/me', authController.getCurrentUser)
router.post('/forgot-password', authController.forgotPassword)
router.get('/reset-password/:token', authController.validateResetToken)
router.post('/reset-password', authController.resetPassword)

export default router
