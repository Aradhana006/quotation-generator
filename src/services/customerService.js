/**
 * Customer master data service.
 *
 * Future: GET/POST/PUT/DELETE /api/customers
 */

import { STORAGE_KEYS } from '../data/defaults.js'
import { createSavedCustomer } from '../utils/dataMappers.js'
import { generateId, readStorage, writeStorage } from './storageAdapter.js'

function getAll() {
  return readStorage(STORAGE_KEYS.customers, [])
}

function saveAll(customers) {
  writeStorage(STORAGE_KEYS.customers, customers)
}

export function getCustomers() {
  // Future: return apiClient.get('/customers')
  return getAll()
}

export function getCustomerById(id) {
  // Future: return apiClient.get(`/customers/${id}`)
  return getAll().find((customer) => customer.id === id) || null
}

export function createCustomer(customerData) {
  // Future: return apiClient.post('/customers', customerData)
  const customer = createSavedCustomer(customerData)
  saveAll([...getAll(), customer])
  return customer
}

export function updateCustomer(id, customerData) {
  // Future: return apiClient.put(`/customers/${id}`, customerData)
  const updated = getAll().map((customer) =>
    customer.id === id ? { ...customer, ...customerData, id } : customer,
  )
  saveAll(updated)
  return updated.find((customer) => customer.id === id) || null
}

export function deleteCustomer(id) {
  // Future: return apiClient.delete(`/customers/${id}`)
  saveAll(getAll().filter((customer) => customer.id !== id))
}

export { generateId }
