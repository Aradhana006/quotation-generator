import * as termModel from '../models/termModel.js'
import { errorResponse, successResponse } from '../utils/response.js'

export async function getDefaultTerms(req, res) {
  try {
    const terms = await termModel.getDefaultTerms(req.companyId)
    return successResponse(res, terms, 'Default terms loaded.')
  } catch (error) {
    console.error('getDefaultTerms error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load default terms.', 500)
  }
}

export async function saveDefaultTerms(req, res) {
  try {
    const terms = Array.isArray(req.body.terms) ? req.body.terms : req.body
    const saved = await termModel.saveDefaultTerms(terms, req.companyId)
    return successResponse(res, saved, 'Default terms saved.')
  } catch (error) {
    console.error('saveDefaultTerms error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to save default terms.', 500)
  }
}
