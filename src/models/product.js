/**
 * Master data: reusable product/service catalog.
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} unit
 * @property {number} defaultPrice
 * @property {number} defaultTax
 */

export const PRODUCT_SHAPE = {
  id: '',
  name: '',
  description: '',
  unit: '',
  defaultPrice: 0,
  defaultTax: 18,
}

export const EMPTY_PRODUCT = { ...PRODUCT_SHAPE }
