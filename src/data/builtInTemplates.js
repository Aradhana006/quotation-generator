export const BUILT_IN_TEMPLATES = [
  {
    id: 'modern',
    type: 'builtin',
    name: 'Modern',
    description: 'Minimal, clean, and spacious layout.',
  },
  {
    id: 'professional',
    type: 'builtin',
    name: 'Professional',
    description: 'Corporate structure with strong hierarchy.',
  },
  {
    id: 'classic',
    type: 'builtin',
    name: 'Classic',
    description: 'Traditional formal quotation style.',
  },
]

export const DEFAULT_SELECTED_TEMPLATE = {
  type: 'builtin',
  id: 'modern',
}

export const SUPPORTED_TEMPLATE_FORMATS = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const SUPPORTED_FORMAT_LABELS = 'PDF, PNG, JPG, JPEG, DOCX'
