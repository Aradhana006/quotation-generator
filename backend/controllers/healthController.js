import { testDatabaseConnection } from '../config/database.js'
import { errorResponse, successResponse } from '../utils/response.js'

export async function getDatabaseHealth(req, res) {
  try {
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      return errorResponse(res, 'DB_UNAVAILABLE', 'Database connection failed.', 503)
    }

    return successResponse(res, null, 'Database connection successful.')
  } catch (error) {
    console.error('Database health check failed:', error.message)
    // Surface a short reason so Render/Vercel misconfig is easier to fix.
    const hint = String(error.message || '')
      .replace(/password=[^@\s]+/gi, 'password=***')
      .slice(0, 180)
    return errorResponse(
      res,
      'DB_UNAVAILABLE',
      hint
        ? `Database connection failed: ${hint}`
        : 'Database connection failed.',
      503,
    )
  }
}
