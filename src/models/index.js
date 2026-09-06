/**
 * Canonical data models for the Quotation Generator.
 *
 * These shapes represent the TARGET contract shared by frontend, API, and database.
 * Some frontend code still uses legacy field names (noted below) — services map between them.
 */

export { USER_SHAPE, EMPTY_USER } from './user.js'
export { COMPANY_PROFILE_SHAPE, EMPTY_COMPANY_PROFILE } from './companyProfile.js'
export { CUSTOMER_SHAPE, EMPTY_CUSTOMER, EMPTY_SAVED_CUSTOMER } from './customer.js'
export { PRODUCT_SHAPE, EMPTY_PRODUCT } from './product.js'
export {
  TEMPLATE_SELECTION_SHAPE,
  CUSTOM_TEMPLATE_SHAPE,
  BUILTIN_TEMPLATE_SHAPE,
} from './template.js'
export { TERM_SHAPE, EMPTY_TERM } from './term.js'
export {
  QUOTATION_SHAPE,
  QUOTATION_ITEM_SHAPE,
  ADDITIONAL_CHARGE_SHAPE,
  QUOTATION_STATUSES,
} from './quotation.js'
