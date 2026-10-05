import { SUPPORTED_TEMPLATE_FORMATS } from '../data/builtInTemplates'

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isSupportedTemplateFile(file) {
  if (SUPPORTED_TEMPLATE_FORMATS.includes(file.type)) return true
  return /\.(pdf|png|jpe?g|docx)$/i.test(file.name || '')
}

export function isImageFile(fileType) {
  return fileType.startsWith('image/')
}

export function isPdfFile(fileType) {
  return fileType === 'application/pdf'
}

export function isDocxFile(fileType) {
  return fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export function createCustomTemplateFromFile(file, name) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: name.trim(),
        type: 'custom',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        previewUrl: reader.result,
        createdAt: new Date().toISOString(),
      })
    }

    reader.onerror = () => {
      reject(new Error('Could not read the selected file.'))
    }

    reader.readAsDataURL(file)
  })
}

export function revokeTemplatePreviewUrl(template) {
  if (template?.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(template.previewUrl)
  }
}

export function templatesMatch(templateA, templateB) {
  if (!templateA || !templateB) return false
  return templateA.type === templateB.type && templateA.id === templateB.id
}

export function getTemplateLabel(selectedTemplate, customTemplates, builtInTemplates) {
  if (selectedTemplate.type === 'custom') {
    const custom = customTemplates.find((item) => item.id === selectedTemplate.id)
    return custom?.name || 'Custom Template'
  }

  const builtIn = builtInTemplates.find((item) => item.id === selectedTemplate.id)
  return builtIn?.name || 'Template'
}
