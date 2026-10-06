/**
 * Customer master data service.
 *
 * Architecture:
 *   Customers page → customerService → HTTP API → Express → PostgreSQL
 */

import { API_ENDPOINTS } from '../config/api.js'
import { apiClient } from './apiClient.js'

export async function getCustomers() {
  return apiClient.get(API_ENDPOINTS.customers)
}

export async function getCustomerById(id) {
  return apiClient.get(`${API_ENDPOINTS.customers}/${id}`)
}

export async function createCustomer(customerData) {
  return apiClient.post(API_ENDPOINTS.customers, customerData)
}

export async function updateCustomer(id, customerData) {
  return apiClient.put(`${API_ENDPOINTS.customers}/${id}`, customerData)
}

export async function deleteCustomer(id) {
  return apiClient.delete(`${API_ENDPOINTS.customers}/${id}`)
}
