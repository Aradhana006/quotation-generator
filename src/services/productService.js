/**
 * Product master data service.
 *
 * Future: GET/POST/PUT/DELETE /api/products
 */

import { STORAGE_KEYS } from '../data/defaults.js'
import { createProduct } from '../utils/dataMappers.js'
import { readStorage, writeStorage } from './storageAdapter.js'

function getAll() {
  return readStorage(STORAGE_KEYS.products, [])
}

function saveAll(products) {
  writeStorage(STORAGE_KEYS.products, products)
}

export function getProducts() {
  // Future: return apiClient.get('/products')
  return getAll()
}

export function getProductById(id) {
  // Future: return apiClient.get(`/products/${id}`)
  return getAll().find((product) => product.id === id) || null
}

export function createProduct(productData) {
  // Future: return apiClient.post('/products', productData)
  const product = createProduct(productData)
  saveAll([...getAll(), product])
  return product
}

export function updateProduct(id, productData) {
  // Future: return apiClient.put(`/products/${id}`, productData)
  const updated = getAll().map((product) =>
    product.id === id
      ? {
          ...product,
          ...productData,
          id,
          defaultPrice: Number(productData.defaultPrice) || 0,
          defaultTax: Number(productData.defaultTax) || 0,
        }
      : product,
  )
  saveAll(updated)
  return updated.find((product) => product.id === id) || null
}

export function deleteProduct(id) {
  // Future: return apiClient.delete(`/products/${id}`)
  saveAll(getAll().filter((product) => product.id !== id))
}
