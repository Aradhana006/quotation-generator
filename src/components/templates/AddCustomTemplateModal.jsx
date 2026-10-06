import { useEffect, useState } from 'react'
import { SUPPORTED_FORMAT_LABELS } from '../../data/builtInTemplates'
import { formatFileSize, isSupportedTemplateFile } from '../../utils/templateFileUtils'
import { inputClassName, labelClassName } from '../quotation/formStyles'

function AddCustomTemplateModal({
  isOpen,
  onClose,
  onUpload,
  onUpdate,
  editingTemplate = null,
}) {
  const isEditing = Boolean(editingTemplate)
  const [templateName, setTemplateName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setTemplateName(editingTemplate?.name || '')
      setSelectedFile(null)
      setError('')
      setProgress(0)
    }
  }, [isOpen, editingTemplate])

  if (!isOpen) return null

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setError('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!isSupportedTemplateFile(file)) {
      setError(`Unsupported file type. Supported formats: ${SUPPORTED_FORMAT_LABELS}`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!templateName.trim()) {
      setError('Template name is required.')
      return
    }

    if (!isEditing && !selectedFile) {
      setError('Please choose a file to upload.')
      return
    }

    setIsUploading(true)
    setError('')
    setProgress(0)

    try {
      if (isEditing) {
        await onUpdate(
          editingTemplate.id,
          { name: templateName.trim(), file: selectedFile || undefined },
          setProgress,
        )
      } else {
        await onUpload(templateName.trim(), selectedFile, setProgress)
      }

      setTemplateName('')
      setSelectedFile(null)
      onClose()
    } catch (uploadError) {
      setError(uploadError.message || 'Could not upload template. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  function handleClose() {
    if (isUploading) return
    setTemplateName('')
    setSelectedFile(null)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Custom Template' : 'Add Custom Template'}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="templateName" className={labelClassName}>
              Template Name
            </label>
            <input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="templateFile" className={labelClassName}>
              {isEditing ? 'Replace File (optional)' : 'Upload Format'}
            </label>
            <input
              id="templateFile"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              Supported formats: {SUPPORTED_FORMAT_LABELS}
            </p>
          </div>

          {selectedFile && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <p><span className="font-medium">File:</span> {selectedFile.name}</p>
              <p className="mt-1"><span className="font-medium">Type:</span> {selectedFile.type || 'unknown'}</p>
              <p className="mt-1"><span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}</p>
            </div>
          )}

          {isUploading && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${Math.max(progress, 8)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Uploading… {progress}%</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isUploading ? 'Uploading…' : isEditing ? 'Save Changes' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCustomTemplateModal
