import bcrypt from 'bcrypt'
import pool from '../config/database.js'
import * as companyModel from '../models/companyModel.js'
import * as userModel from '../models/userModel.js'
import { isHoneypotTriggered } from '../utils/honeypot.js'
import { errorResponse, successResponse } from '../utils/response.js'

const SALT_ROUNDS = 10

function validateRegisterBody(body) {
  if (!body.name?.trim()) return 'Full name is required.'
  if (!body.email?.trim()) return 'Email is required.'
  if (!body.password || body.password.length < 6) {
    return 'Password must be at least 6 characters.'
  }
  if (!body.companyName?.trim()) return 'Company name is required.'
  return null
}

function validateLoginBody(body) {
  if (!body.email?.trim()) return 'Email is required.'
  if (!body.password) return 'Password is required.'
  return null
}

function buildAuthPayload(user, company) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || '',
    },
    company: {
      id: company.id,
      name: company.name || '',
    },
  }
}

async function authenticateSession(req, userId, companyId) {
  req.session.userId = userId
  req.session.companyId = companyId
}

export async function register(req, res) {
  // Bots that fill honeypot fields get a fake success and no account.
  if (isHoneypotTriggered(req.body)) {
    return successResponse(
      res,
      { requiresLogin: true },
      'Registration successful. Please log in.',
      201,
    )
  }

  const validationError = validateRegisterBody(req.body)
  if (validationError) {
    return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
  }

  const { name, email, password, companyName } = req.body
  const client = await pool.connect()

  try {
    const existing = await userModel.findUserByEmail(email)
    if (existing) {
      return errorResponse(res, 'CONFLICT', 'An account with this email already exists.', 409)
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    await client.query('BEGIN')

    const companyRow = await client.query(
      `INSERT INTO companies (name) VALUES ($1) RETURNING *`,
      [companyName.trim()],
    )
    const company = companyRow.rows[0]

    const userRow = await client.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3) RETURNING id`,
      [email.trim().toLowerCase(), passwordHash, name.trim()],
    )

    await client.query(
      `INSERT INTO company_users (company_id, user_id) VALUES ($1, $2)`,
      [company.id, userRow.rows[0].id],
    )

    await client.query('COMMIT')

    // Do not create a session — the user must log in after registering.
    return successResponse(
      res,
      { requiresLogin: true },
      'Registration successful. Please log in.',
      201,
    )
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('register error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to register account.', 500)
  } finally {
    client.release()
  }
}

export async function login(req, res) {
  if (isHoneypotTriggered(req.body)) {
    return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401)
  }

  const validationError = validateLoginBody(req.body)
  if (validationError) {
    return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
  }

  try {
    const { email, password } = req.body
    const userRow = await userModel.findUserByEmail(email)

    if (!userRow?.password_hash) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401)
    }

    const passwordMatches = await bcrypt.compare(password, userRow.password_hash)
    if (!passwordMatches) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401)
    }

    const companyId = await userModel.getCompanyIdForUser(userRow.id)
    if (!companyId) {
      return errorResponse(res, 'NOT_FOUND', 'Company not found for this user.', 404)
    }

    await authenticateSession(req, userRow.id, companyId)

    const company = await companyModel.getCompanyById(companyId)
    const safeUser = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name || '',
    }

    return successResponse(res, buildAuthPayload(safeUser, company), 'Login successful.')
  } catch (error) {
    console.error('login error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to log in.', 500)
  }
}

export async function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error('logout error:', error.message)
      return errorResponse(res, 'INTERNAL_ERROR', 'Unable to log out.', 500)
    }

    res.clearCookie('connect.sid')
    return successResponse(res, null, 'Logged out successfully.')
  })
}

export async function getCurrentUser(req, res) {
  if (!req.session?.userId || !req.session?.companyId) {
    return errorResponse(res, 'UNAUTHORIZED', 'Not authenticated.', 401)
  }

  try {
    const userRow = await userModel.findUserById(req.session.userId)
    if (!userRow) {
      return errorResponse(res, 'UNAUTHORIZED', 'Not authenticated.', 401)
    }

    const company = await companyModel.getCompanyById(req.session.companyId)
    if (!company) {
      return errorResponse(res, 'NOT_FOUND', 'Company not found.', 404)
    }

    const safeUser = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name || '',
    }

    return successResponse(res, buildAuthPayload(safeUser, company), 'Authenticated.')
  } catch (error) {
    console.error('getCurrentUser error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load user.', 500)
  }
}
