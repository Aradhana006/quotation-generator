import path from 'path'

export const MAX_TEMPLATE_FILE_SIZE = 10 * 1024 * 1024

const EXTENSION_MAP = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function hasMagic(buffer, bytes) {
  return bytes.every((value, index) => buffer[index] === value)
}

function matchesType(buffer, mime) {
  if (mime === 'application/pdf') return buffer.toString('utf8', 0, 4) === '%PDF'
  if (mime === 'image/png') return hasMagic(buffer, [0x89, 0x50, 0x4e, 0x47])
  if (mime === 'image/jpeg') return hasMagic(buffer, [0xff, 0xd8, 0xff])
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return hasMagic(buffer, [0x50, 0x4b])
  }
  return false
}

export function sanitizeFileName(originalName) {
  const base = path.basename(originalName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')
  return base.slice(0, 180) || 'upload'
}

export function validateTemplateFile(file) {
  if (!file?.buffer?.length) {
    return { error: 'A file is required.' }
  }

  if (file.size > MAX_TEMPLATE_FILE_SIZE) {
    return { error: 'File too large.' }
  }

  const extension = path.extname(file.originalname || '').toLowerCase()
  const expectedMime = EXTENSION_MAP[extension]
  if (!expectedMime) {
    return { error: 'Invalid file type.' }
  }

  if (!matchesType(file.buffer, expectedMime)) {
    return { error: 'Invalid file type.' }
  }

  return {
    fileName: sanitizeFileName(file.originalname),
    fileType: expectedMime,
    fileSize: file.size,
  }
}

export function isPreviewable(fileType) {
  return fileType === 'application/pdf' || fileType.startsWith('image/')
}
