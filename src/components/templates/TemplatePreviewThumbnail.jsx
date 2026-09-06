import { isDocxFile, isImageFile, isPdfFile } from '../../utils/templateFileUtils'

function TemplatePreviewThumbnail({ template }) {
  if (template.type === 'builtin') {
    const styles = {
      modern: 'bg-gradient-to-br from-slate-50 to-white',
      professional: 'bg-white border-2 border-slate-900',
      classic: 'bg-amber-50 border border-slate-400',
    }

    return (
      <div
        className={`flex h-40 items-end rounded-lg p-4 ${styles[template.id] || styles.modern}`}
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">{template.name}</p>
          <p className="mt-1 text-xs text-slate-500">{template.description}</p>
        </div>
      </div>
    )
  }

  if (isImageFile(template.fileType) && template.previewUrl) {
    return (
      <img
        src={template.previewUrl}
        alt={template.name}
        className="h-40 w-full rounded-lg border border-slate-200 object-cover"
      />
    )
  }

  if (isPdfFile(template.fileType)) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-700">PDF Template</p>
        <p className="mt-1 text-xs text-slate-500">{template.fileName}</p>
      </div>
    )
  }

  if (isDocxFile(template.fileType)) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-700">DOCX Template</p>
        <p className="mt-1 text-xs text-slate-500">{template.fileName}</p>
      </div>
    )
  }

  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
      Preview unavailable
    </div>
  )
}

export default TemplatePreviewThumbnail
