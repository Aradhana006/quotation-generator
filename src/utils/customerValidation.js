const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const EMPTY_CUSTOMER = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
}

export function validateCustomer(customer) {
  const errors = {}

  if (!customer.name.trim()) {
    errors.name = 'Customer name is required'
  }

  if (!customer.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(customer.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!customer.phone.trim()) {
    errors.phone = 'Phone number is required'
  }

  return errors
}

export function isCustomerValid(customer) {
  return Object.keys(validateCustomer(customer)).length === 0
}
