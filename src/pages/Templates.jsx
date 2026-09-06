import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILT_IN_TEMPLATES } from '../data/builtInTemplates'
import { useTemplates } from '../context/TemplateContext'
import PageContainer from '../components/PageContainer'
import AddCustomTemplateModal from '../components/templates/AddCustomTemplateModal'
import TemplatePreviewThumbnail from '../components/templates/TemplatePreviewThumbnail'

function Templates() {
  const navigate = useNavigate()
  const { customTemplates, addCustomTemplate, deleteCustomTemplate, selectTemplate } =
    useTemplates()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleUseTemplate(templateSelection) {
    selectTemplate(templateSelection)
    navigate('/quotations/create')
  }

  function handleDeleteTemplate(id, name) {
    const confirmed = window.confirm(`Delete custom template "${name}"?`)
    if (confirmed) {
      deleteCustomTemplate(id)
    }
  }

  return (
    <PageContainer
      title="Templates"
      description="Choose a built-in layout or upload your own quotation format."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
        >
          <span className="text-4xl font-light text-slate-500">+</span>
          <span className="mt-3 text-base font-semibold text-slate-800">Add Custom Format</span>
          <span className="mt-1 text-sm text-slate-500">Upload PDF, image, or DOCX</span>
        </button>

        {BUILT_IN_TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="p-4">
              <TemplatePreviewThumbnail template={template} />
            </div>
            <div className="border-t border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{template.description}</p>
              <button
                type="button"
                onClick={() => handleUseTemplate({ type: 'builtin', id: template.id })}
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Use Template
              </button>
            </div>
          </article>
        ))}

        {customTemplates.map((template) => (
          <article
            key={template.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="p-4">
              <TemplatePreviewThumbnail template={template} />
            </div>
            <div className="border-t border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-500">Custom Template</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUseTemplate({ type: 'custom', id: template.id })}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Use Template
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(template.id, template.name)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AddCustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={addCustomTemplate}
      />
    </PageContainer>
  )
}

export default Templates
