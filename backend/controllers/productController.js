import * as productModel from '../models/productModel.js'
import { errorResponse, successResponse } from '../utils/response.js'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function validateProductBody(body) {
  if (!body.name?.trim()) {
    return 'Product name is required.'
  }

  if (!body.unit?.trim()) {
    return 'Unit is required.'
  }

  const defaultPrice = Number(body.defaultPrice)
  if (Number.isNaN(defaultPrice)) {
    return 'Default price must be a valid number.'
  }
  if (defaultPrice < 0) {
    return 'Default price cannot be negative.'
  }

  const defaultTax = body.defaultTax === undefined || body.defaultTax === ''
    ? 0
    : Number(body.defaultTax)
  if (Number.isNaN(defaultTax)) {
    return 'Default tax must be a valid number.'
  }
  if (defaultTax < 0) {
    return 'Default tax cannot be negative.'
  }

  return null
}

function normalizeProductBody(body) {
  return {
    name: body.name,
    description: body.description,
    unit: body.unit,
    defaultPrice: Number(body.defaultPrice),
    defaultTax: body.defaultTax === undefined || body.defaultTax === ''
      ? 0
      : Number(body.defaultTax),
  }
}

export async function createProduct(req, res) {
  try {
    const validationError = validateProductBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const product = await productModel.createProduct(
      normalizeProductBody(req.body),
      req.companyId,
    )
    return successResponse(res, product, 'Product created successfully.', 201)
  } catch (error) {
    console.error('createProduct error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to create product.', 500)
  }
}

export async function getProducts(req, res) {
  try {
    const products = await productModel.getProducts(req.companyId)
    return successResponse(res, products, 'Products loaded successfully.')
  } catch (error) {
    console.error('getProducts error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load products.', 500)
  }
}

export async function getProductById(req, res) {
  try {
    if (!isValidUuid(req.params.id)) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid product ID.', 400)
    }

    const product = await productModel.getProductById(req.params.id, req.companyId)
    if (!product) {
      return errorResponse(res, 'NOT_FOUND', 'Product not found.', 404)
    }

    return successResponse(res, product, 'Product loaded successfully.')
  } catch (error) {
    console.error('getProductById error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to load product.', 500)
  }
}

export async function updateProduct(req, res) {
  try {
    if (!isValidUuid(req.params.id)) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid product ID.', 400)
    }

    const validationError = validateProductBody(req.body)
    if (validationError) {
      return errorResponse(res, 'VALIDATION_ERROR', validationError, 400)
    }

    const product = await productModel.updateProduct(
      req.params.id,
      normalizeProductBody(req.body),
      req.companyId,
    )
    if (!product) {
      return errorResponse(res, 'NOT_FOUND', 'Product not found.', 404)
    }

    return successResponse(res, product, 'Product updated successfully.')
  } catch (error) {
    console.error('updateProduct error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to update product.', 500)
  }
}

export async function deleteProduct(req, res) {
  try {
    if (!isValidUuid(req.params.id)) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid product ID.', 400)
    }

    const deleted = await productModel.deleteProduct(req.params.id, req.companyId)
    if (!deleted) {
      return errorResponse(res, 'NOT_FOUND', 'Product not found.', 404)
    }

    return successResponse(res, { id: req.params.id }, 'Product deleted successfully.')
  } catch (error) {
    console.error('deleteProduct error:', error.message)
    return errorResponse(res, 'INTERNAL_ERROR', 'Unable to delete product.', 500)
  }
}
