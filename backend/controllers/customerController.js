import * as customerModel from '../models/customerModel.js'
import { errorResponse, successResponse } from '../utils/response.js'

function validateCustomerBody(body) {
  if (!body.companyName?.trim()) {
    return 'Company name is required.'
  }
  return null
}

export async function createCustomer(req, res) {
  try {
    const validationError = validateCustomerBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const customer = await customerModel.createCustomer(req.body, req.companyId)
    return successResponse(res, customer, 'Customer created successfully.', 201)
  } catch (error) {
    console.error('createCustomer error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to create customer.', 500)
  }
}

export async function getCustomers(req, res) {
  try {
    const customers = await customerModel.getCustomers(req.companyId)
    return successResponse(res, customers, 'Customers loaded successfully.')
  } catch (error) {
    console.error('getCustomers error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load customers.', 500)
  }
}

export async function getCustomerById(req, res) {
  try {
    const customer = await customerModel.getCustomerById(req.params.id, req.companyId)
    if (!customer) {
      return errorResponse(res, 'NOT_FOUND', 'Customer not found.', 404)
    }
    return successResponse(res, customer, 'Customer loaded successfully.')
  } catch (error) {
    console.error('getCustomerById error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load customer.', 500)
  }
}

export async function updateCustomer(req, res) {
  try {
    const validationError = validateCustomerBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const customer = await customerModel.updateCustomer(
      req.params.id,
      req.body,
      req.companyId,
    )
    if (!customer) {
      return errorResponse(res, 'NOT_FOUND', 'Customer not found.', 404)
    }

    return successResponse(res, customer, 'Customer updated successfully.')
  } catch (error) {
    console.error('updateCustomer error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to update customer.', 500)
  }
}

export async function deleteCustomer(req, res) {
  try {
    const deleted = await customerModel.deleteCustomer(req.params.id, req.companyId)
    if (!deleted) {
      return errorResponse(res, 'NOT_FOUND', 'Customer not found.', 404)
    }

    return successResponse(res, { id: req.params.id }, 'Customer deleted successfully.')
  } catch (error) {
    console.error('deleteCustomer error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to delete customer.', 500)
  }
}
