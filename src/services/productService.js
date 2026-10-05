/**
 * Product master data service.
 *
 * Architecture:
 *   Products page → productService → HTTP API → Express → PostgreSQL
 */

import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function getProducts() {
  return apiClient.get(API_ENDPOINTS.products)
}

export async function getProduct(id) {
  return apiClient.get(`${API_ENDPOINTS.products}/${id}`)
}

export async function createProduct(productData) {
  return apiClient.post(API_ENDPOINTS.products, productData)
}

export async function updateProduct(id, productData) {
  return apiClient.put(`${API_ENDPOINTS.products}/${id}`, productData)
}

export async function deleteProduct(id) {
  return apiClient.delete(`${API_ENDPOINTS.products}/${id}`)
}
