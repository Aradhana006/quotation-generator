import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../context/TemplateContext'
import PageContainer from '../components/PageContainer'
import AddCustomTemplateModal from '../components/templates/AddCustomTemplateModal'
import TemplateCard from '../components/templates/TemplateCard'

function Templates() {
  const navigate = useNavigate()
  const {
    templates,
    customTemplates,
    templatesLoading,
    templatesError,
    selectedTemplate,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    selectTemplate,
  } = useTemplates()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [actionError, setActionError] = useState('')

  const builtInTemplates = templates.filter((template) => template.type === 'builtin')

  function handleUseTemplate(templateSelection) {
    selectTemplate(templateSelection)
    navigate('/quotations/create')
  }

  function handleEdit(template) {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  function handleEditLayout(template) {
    navigate(`/templates/${template.id}/edit`)
  }

  async function handleDelete(template) {
    const confirmed = window.confirm(`Delete custom template "${template.name}"?`)
    if (!confirmed) return
    setActionError('')
    try {
      await deleteCustomTemplate(template.id)
    } catch (error) {
      setActionError(error.message || 'Unable to delete template.')
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingTemplate(null)
  }

  return (
    <PageContainer
      title="Templates"
      description="Choose a built-in layout or upload your own quotation format."
    >
      {templatesLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading templates...</p>
      )}

      {templatesError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {templatesError}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setEditingTemplate(null)
          setIsModalOpen(true)
        }}
        className="mb-8 flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
      >
        <span className="text-4xl font-light text-slate-500">+</span>
        <span className="mt-3 text-base font-semibold text-slate-800">Add Custom Format</span>
        <span className="mt-1 text-sm text-slate-500">Upload PDF, PNG, JPG, JPEG, or DOCX</span>
      </button>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Built-in Templates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {builtInTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={
                selectedTemplate.type === 'builtin' && selectedTemplate.id === template.id
              }
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          My Templates
        </h2>
        {customTemplates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No custom formats yet. Click “Add Custom Format” to upload one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={
                  selectedTemplate.type === 'custom' && selectedTemplate.id === template.id
                }
                onUse={handleUseTemplate}
                onEdit={handleEdit}
                onEditLayout={handleEditLayout}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <AddCustomTemplateModal
        isOpen={isModalOpen}
        editingTemplate={editingTemplate}
        onClose={handleCloseModal}
        onUpload={async (name, file, onProgress) => {
          const created = await addCustomTemplate(name, file, onProgress)
          if (created?.id) navigate(`/templates/${created.id}/edit`)
          return created
        }}
        onUpdate={updateCustomTemplate}
      />
    </PageContainer>
  )
}

export default Templates
