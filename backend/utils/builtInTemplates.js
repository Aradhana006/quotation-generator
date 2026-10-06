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

export function getBuiltInTemplate(id) {
  return BUILT_IN_TEMPLATES.find((template) => template.id === id) || null
}

export function mapBuiltInTemplate(template) {
  return {
    id: template.id,
    type: 'builtin',
    name: template.name,
    description: template.description,
    fileUrl: null,
    fileName: null,
    fileType: null,
    fileSize: 0,
    previewUrl: null,
    configuration: {},
    createdAt: null,
    updatedAt: null,
  }
}
