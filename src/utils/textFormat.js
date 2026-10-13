/** Force uppercase for codes like GSTIN / IFSC as the user types. */
export function toUpperCaseValue(value) {
  return String(value ?? '').toUpperCase()
}

export function isUppercaseCodeField(field) {
  return field === 'gstin' || field === 'ifsc'
}
