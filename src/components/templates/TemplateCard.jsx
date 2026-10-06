import TemplatePreviewThumbnail from './TemplatePreviewThumbnail'

function TemplateCard({
  template,
  selected = false,
  onUse,
  onEdit,
  onEditLayout,
  onDelete,
}) {
  const isCustom = template.type === 'custom'

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
        selected ? 'border-slate-900' : 'border-slate-200'
      }`}
    >
      <div className="p-4">
        <TemplatePreviewThumbnail template={template} />
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {isCustom ? 'Custom Template' : template.description}
            </p>
          </div>
          {selected && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
              Selected
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onUse({ type: template.type, id: template.id })}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Use Template
          </button>
          {isCustom && (
            <>
              <button
                type="button"
                onClick={() => onEditLayout?.(template)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit Layout
              </button>
              <button
                type="button"
                onClick={() => onEdit(template)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => onDelete(template)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default TemplateCard
