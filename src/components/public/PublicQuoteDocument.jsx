import { configurationHasMappedFields } from '../../utils/resolveTemplateField'
import QuoteTemplateRenderer from '../templates/QuoteTemplateRenderer'

function PublicQuoteDocument({ quotationData, selectedTemplate, customTemplate }) {
  const hasMapping = configurationHasMappedFields(customTemplate?.configuration)
  const resolvedTemplate =
    selectedTemplate?.type === 'custom' && hasMapping
      ? selectedTemplate
      : selectedTemplate?.type === 'custom'
        ? { type: 'builtin', id: 'modern' }
        : selectedTemplate || { type: 'builtin', id: 'modern' }
  const customTemplates = hasMapping && customTemplate
    ? [{ id: selectedTemplate?.id, ...customTemplate }]
    : []

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
      <QuoteTemplateRenderer
        selectedTemplate={resolvedTemplate}
        quotationData={quotationData}
        customTemplates={customTemplates}
      />
    </div>
  )
}

export default PublicQuoteDocument
