import { useMemo, useState } from 'react'
import { BUILT_IN_TEMPLATES } from '../../data/builtInTemplates'
import { templatesMatch } from '../../utils/templateFileUtils'
import TemplatePreviewThumbnail from './TemplatePreviewThumbnail'
import TemplateViewModal from './TemplateViewModal'

function TemplateSelector({
  selectedTemplate,
  customTemplates,
  onSelectTemplate,
  onAddCustomClick,
  compact = false,
  quotationData,
}) {
  const [viewingTemplate, setViewingTemplate] = useState(null)

  const builtInCards = [
    { id: 'modern', name: 'Modern', description: 'Minimal and spacious', type: 'builtin' },
    { id: 'professional', name: 'Professional', description: 'Corporate and structured', type: 'builtin' },
    { id: 'classic', name: 'Classic', description: 'Traditional and formal', type: 'builtin' },
  ]

  const selectedCard = useMemo(() => {
    if (!selectedTemplate) return null
    if (selectedTemplate.type === 'builtin') {
      const builtIn = builtInCards.find((card) => card.id === selectedTemplate.id)
      const meta = BUILT_IN_TEMPLATES.find((template) => template.id === selectedTemplate.id)
      return builtIn
        ? { ...builtIn, description: meta?.description || builtIn.description }
        : null
    }
    const custom = customTemplates.find((template) => template.id === selectedTemplate.id)
    return custom
      ? {
          ...custom,
          type: 'custom',
          description: 'Custom Template',
        }
      : null
  }, [selectedTemplate, customTemplates])

  const canView = Boolean(selectedCard)

  function handleView() {
    if (!selectedCard) return
    setViewingTemplate(selectedCard)
  }

  if (compact) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Template</h2>
          <p className="text-xs text-slate-500">Select a design for this quotation</p>
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
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleView}
            disabled={!canView}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            View
          </button>
          {selectedCard ? (
            <p className="text-xs text-slate-500">
              Selected: <span className="font-medium text-slate-700">{selectedCard.name}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400">Select a template to enable View</p>
          )}
        </div>

        <TemplateViewModal
          template={viewingTemplate}
          customTemplates={customTemplates}
          quotationData={quotationData}
          onClose={() => setViewingTemplate(null)}
        />
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Template</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a design, then use View to open it fullscreen.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={onAddCustomClick}
          className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-slate-400 hover:bg-slate-100"
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
              className={`overflow-hidden rounded-lg border text-left transition ${
                isSelected
                  ? 'border-teal-700 ring-2 ring-teal-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <TemplatePreviewThumbnail
                template={{
                  type: 'builtin',
                  id: template.id,
                  name: template.name,
                  description: template.description,
                }}
              />
              <div className="border-t border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{template.description}</p>
              </div>
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
              className={`overflow-hidden rounded-lg border text-left transition ${
                isSelected
                  ? 'border-teal-700 ring-2 ring-teal-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <TemplatePreviewThumbnail template={template} />
              <div className="border-t border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">Custom Template</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleView}
          disabled={!canView}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          View
        </button>
        {selectedCard ? (
          <p className="text-sm text-slate-500">
            Selected: <span className="font-medium text-slate-700">{selectedCard.name}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-400">Select a template to enable View</p>
        )}
      </div>

      <TemplateViewModal
        template={viewingTemplate}
        customTemplates={customTemplates}
        quotationData={quotationData}
        onClose={() => setViewingTemplate(null)}
      />
    </section>
  )
}

export default TemplateSelector
