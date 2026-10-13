import { getTemplateTheme } from '../../data/templateThemes'
import { isDocxFile, isImageFile, isPdfFile } from '../../utils/templateFileUtils'

function BuiltinDesignPreview({ templateId, name, large = false }) {
  const theme = getTemplateTheme(templateId)
  const c = theme.colors
  const height = large ? 'h-56' : 'h-40'

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white ${height}`}
      style={{
        backgroundColor: '#ffffff',
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="relative z-10 flex h-full flex-col p-3">
        <div className="mb-2 flex items-center justify-end gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
            style={{ backgroundColor: c.accent }}
          >
            {name.slice(0, 1)}
          </div>
        </div>
        <div className="mb-2 flex justify-between text-[9px]" style={{ color: c.text }}>
          <span>QT-2026-001</span>
          <span>Date</span>
        </div>
        <div
          className="mb-1 grid grid-cols-5 gap-px text-[8px] font-semibold text-white"
          style={{ backgroundColor: c.tableHeaderBg }}
        >
          {['Sno', 'Desc', 'Price', 'Qty', 'Total'].map((label) => (
            <div key={label} className="px-1 py-1 text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded bg-slate-100" />
          <div className="h-1.5 w-4/5 rounded bg-slate-100" />
        </div>
        <div className="mt-auto border-t border-slate-200 pt-1.5">
          <p className="text-[9px] font-semibold" style={{ color: c.text }}>
            {name}
          </p>
          <div className="mt-1 flex justify-between text-[9px]" style={{ color: c.muted }}>
            <span>Total</span>
            <span>₹ —</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplatePreviewThumbnail({ template, large = false }) {
  if (template.type === 'builtin') {
    return (
      <BuiltinDesignPreview
        templateId={template.id}
        name={template.name}
        large={large}
      />
    )
  }

  const height = large ? 'h-56' : 'h-40'

  if (isImageFile(template.fileType) && template.previewUrl) {
    return (
      <img
        src={template.previewUrl}
        alt={template.name}
        className={`${height} w-full rounded-lg border border-slate-200 object-cover`}
      />
    )
  }

  if (isPdfFile(template.fileType) && template.previewUrl) {
    return (
      <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${height}`}>
        <iframe
          title={template.name}
          src={`${template.previewUrl}#page=1&view=FitH`}
          className="h-full w-full"
        />
      </div>
    )
  }

  if (isPdfFile(template.fileType)) {
    return (
      <div className={`flex ${height} flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center`}>
        <p className="text-sm font-medium text-slate-700">PDF Template</p>
        <p className="mt-1 text-xs text-slate-500">{template.fileName}</p>
      </div>
    )
  }

  if (isDocxFile(template.fileType)) {
    return (
      <div className={`flex ${height} flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center`}>
        <p className="text-sm font-medium text-slate-700">DOCX Template</p>
        <p className="mt-1 text-xs text-slate-500">{template.fileName}</p>
      </div>
    )
  }

  return (
    <div className={`flex ${height} items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500`}>
      Preview unavailable
    </div>
  )
}

export default TemplatePreviewThumbnail
