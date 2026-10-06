/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} companyId - links user to their company (multi-tenant isolation)
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const USER_SHAPE = {
  id: '',
  email: '',
  name: '',
  companyId: '',
  createdAt: '',
  updatedAt: '',
}

export const EMPTY_USER = { ...USER_SHAPE }
