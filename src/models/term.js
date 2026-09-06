/**
 * Reusable default terms (master data library).
 * When added to a quotation, a COPY is stored in quotation.terms[].
 *
 * @typedef {Object} Term
 * @property {string} id
 * @property {string} text
 * @property {string} category - e.g. 'payment', 'delivery', 'warranty'
 * @property {number} sortOrder
 */

export const TERM_SHAPE = {
  id: '',
  text: '',
  category: 'general',
  sortOrder: 0,
}

export const EMPTY_TERM = { ...TERM_SHAPE }
