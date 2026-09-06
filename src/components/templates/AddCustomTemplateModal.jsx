import { useState } from 'react'
import { SUPPORTED_FORMAT_LABELS } from '../../data/builtInTemplates'
import {
  createCustomTemplateFromFile,
  formatFileSize,
  isSupportedTemplateFile,
} from '../../utils/templateFileUtils'
import { inputClassName, labelClassName } from '../quotation/formStyles'

function AddCustomTemplateModal({ isOpen, onClose, onUpload }) {
  const [templateName, setTemplateName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

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

  function handleUpload() {
    if (!templateName.trim()) {
      setError('Please enter a template name.')
      return
    }

    if (!selectedFile) {
      setError('Please choose a file to upload.')
      return
    }

    createCustomTemplateFromFile(selectedFile, templateName)
      .then((template) => {
        onUpload(template)
        setTemplateName('')
        setSelectedFile(null)
        setError('')
        onClose()
      })
      .catch(() => {
        setError('Could not read the selected file. Please try another file.')
      })
  }

  function handleClose() {
    setTemplateName('')
    setSelectedFile(null)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Custom Template</h2>
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
              placeholder="My Company Quotation"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="templateFile" className={labelClassName}>
              Upload Format
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
              <p className="mt-1"><span className="font-medium">Type:</span> {selectedFile.type}</p>
              <p className="mt-1"><span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Upload Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCustomTemplateModal
