import { templatesMatch } from '../../utils/templateFileUtils'

function TemplateSelector({
  selectedTemplate,
  customTemplates,
  onSelectTemplate,
  onAddCustomClick,
  compact = false,
}) {
  const builtInCards = [
    { id: 'modern', name: 'Modern', description: 'Minimal and spacious' },
    { id: 'professional', name: 'Professional', description: 'Corporate and structured' },
    { id: 'classic', name: 'Classic', description: 'Traditional and formal' },
  ]

  if (compact) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Template</h2>
            <p className="text-xs text-slate-500">Switch layout without losing your data</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={onAddCustomClick}
            title="Add custom template"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50"
          >
            <span className="text-base leading-none">+</span>
            Custom
          </button>

          {builtInCards.map((template) => {
            const isSelected = templatesMatch(selectedTemplate, {
              type: 'builtin',
              id: template.id,
            })

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate({ type: 'builtin', id: template.id })}
                className={`h-9 shrink-0 rounded-xl border px-4 text-sm font-medium transition ${
                  isSelected
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {template.name}
              </button>
            )
          })}

          {customTemplates.map((template) => {
            const isSelected = templatesMatch(selectedTemplate, {
              type: 'custom',
              id: template.id,
            })

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate({ type: 'custom', id: template.id })}
                className={`h-9 shrink-0 rounded-xl border px-4 text-sm font-medium transition ${
                  isSelected
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
                title={template.name}
              >
                {template.name}
              </button>
            )
          })}        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Template</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose how your quotation should look. Data stays the same when you switch templates.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={onAddCustomClick}
          className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-slate-400 hover:bg-slate-100"
        >
          <span className="text-3xl font-light text-slate-500">+</span>
          <span className="mt-2 text-sm font-medium text-slate-700">Add Custom Template</span>
        </button>

        {builtInCards.map((template) => {
          const isSelected = templatesMatch(selectedTemplate, {
            type: 'builtin',
            id: template.id,
          })

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate({ type: 'builtin', id: template.id })}
              className={`rounded-lg border p-4 text-left transition ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-semibold">{template.name}</p>
              <p className={`mt-1 text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                {template.description}
              </p>
            </button>
          )
        })}

        {customTemplates.map((template) => {
          const isSelected = templatesMatch(selectedTemplate, {
            type: 'custom',
            id: template.id,
          })

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate({ type: 'custom', id: template.id })}
              className={`rounded-lg border p-4 text-left transition ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-semibold">{template.name}</p>
              <p className={`mt-1 text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                Custom Template
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default TemplateSelector
