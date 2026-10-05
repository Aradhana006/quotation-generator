import * as companyModel from '../models/companyModel.js'
import { errorResponse, successResponse } from '../utils/response.js'

export async function getCompanyProfile(req, res) {
  try {
    const profile = await companyModel.getCompanyById(req.companyId)
    if (!profile) {
      return errorResponse(res, 'NOT_FOUND', 'Company not found.', 404)
    }
    return successResponse(res, profile, 'Company profile loaded.')
  } catch (error) {
    console.error('getCompanyProfile error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load company profile.', 500)
  }
}

export async function updateCompanyProfile(req, res) {
  try {
    const profile = await companyModel.updateCompany(req.companyId, req.body)
    if (!profile) {
      return errorResponse(res, 'NOT_FOUND', 'Company not found.', 404)
    }
    return successResponse(res, profile, 'Company profile saved.')
  } catch (error) {
    console.error('updateCompanyProfile error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to save company profile.', 500)
  }
}
