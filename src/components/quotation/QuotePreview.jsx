import { getTemplateLabel } from '../../utils/templateFileUtils'
import { BUILT_IN_TEMPLATES } from '../../data/builtInTemplates'
import QuoteTemplateRenderer from '../templates/QuoteTemplateRenderer'

function QuotePreview({ quotationData, selectedTemplate, customTemplates }) {
  const templateLabel = getTemplateLabel(
    selectedTemplate,
    customTemplates,
    BUILT_IN_TEMPLATES,
  )

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Live Preview
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Quotation Preview</h2>
        <p className="mt-1 text-sm text-slate-500">Template: {templateLabel}</p>
      </div>

      <div className="max-h-[calc(100vh-8rem)] overflow-auto bg-slate-100 p-4">
        <QuoteTemplateRenderer
          selectedTemplate={selectedTemplate}
          quotationData={quotationData}
          customTemplates={customTemplates}
        />
      </div>
    </div>
  )
}

export default QuotePreview
