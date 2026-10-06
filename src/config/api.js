/** API base URL — points to Express backend */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  company: '/company',
  customers: '/customers',
  products: '/products',
  templates: '/templates',
  quotations: '/quotations',
  terms: '/terms',
}
