import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import authRoutes from './routes/authRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import productRoutes from './routes/productRoutes.js'
import publicQuotationRoutes from './routes/publicQuotationRoutes.js'
import quotationRoutes from './routes/quotationRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import termRoutes from './routes/termRoutes.js'
import { logDatabaseConnectionStatus } from './config/database.js'
import { getDatabaseHealth } from './controllers/healthController.js'
import { logStorageDriver, serveTemplateFile } from './controllers/templateController.js'
import { requireAuth } from './middleware/authMiddleware.js'
import { successResponse } from './utils/response.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

if (!process.env.SESSION_SECRET) {
  console.warn(
    'Warning: SESSION_SECRET is not set. Using a development default — not safe for production.',
  )
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/api/health', (req, res) => {
  return successResponse(res, null, 'API is running')
})

app.get('/api/health/db', getDatabaseHealth)

app.use('/api/auth', authRoutes)
app.get('/api/templates/file', serveTemplateFile)
app.use('/api/public/quotations', publicQuotationRoutes)

app.use('/api/company', requireAuth, companyRoutes)
app.use('/api/customers', requireAuth, customerRoutes)
app.use('/api/products', requireAuth, productRoutes)
app.use('/api/quotations', requireAuth, quotationRoutes)
app.use('/api/templates', requireAuth, templateRoutes)
app.use('/api/terms', requireAuth, termRoutes)

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  })
})

app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`)
  logStorageDriver()
  await logDatabaseConnectionStatus()
})
