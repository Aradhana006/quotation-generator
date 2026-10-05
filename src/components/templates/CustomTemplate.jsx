import { configurationHasMappedFields } from '../../utils/resolveTemplateField'
import { MetaGrid, QuotationBodyContent } from './shared/QuotationSections'
import CustomTemplateRenderer from './CustomTemplateRenderer'

function FileReferenceNote({ customTemplate }) {
  return (
    <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
      This custom format has no field mapping yet. Open <span className="font-medium">Edit Layout</span> to
      place quotation fields on {customTemplate?.name || 'the uploaded format'}.
    </div>
  )
}

function CustomTemplate({ quotationData, customTemplate }) {
  const { quotationDetails, coverLetter, status } = quotationData
  const hasMapping = configurationHasMappedFields(customTemplate?.configuration)

  if (hasMapping) {
    return (
      <div className="space-y-4 text-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Custom format with saved field mapping
        </p>
        <div className="overflow-auto">
          <CustomTemplateRenderer
            quotation={quotationData}
            configuration={customTemplate.configuration}
            customTemplate={customTemplate}
            scale={0.72}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-8">
        <FileReferenceNote customTemplate={customTemplate} />
        <CustomTemplateRenderer
          quotation={quotationData}
          configuration={customTemplate?.configuration}
          customTemplate={customTemplate}
          scale={0.62}
        />
      </div>

      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Quotation Data</h3>
        <MetaGrid
          quotationDetails={quotationDetails}
          status={status}
          showSubject={!coverLetter.enabled}
        />
        <QuotationBodyContent quotationData={quotationData} />
      </div>
    </div>
  )
}

export default CustomTemplate
