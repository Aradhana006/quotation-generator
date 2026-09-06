import {
  isDocxFile,
  isImageFile,
  isPdfFile,
} from '../../utils/templateFileUtils'
import { MetaGrid, QuotationBodyContent } from './shared/QuotationSections'

function FileReferencePreview({ customTemplate }) {
  if (!customTemplate?.previewUrl) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No preview available for this file type.
      </div>
    )
  }

  if (isImageFile(customTemplate.fileType)) {
    return (
      <img
        src={customTemplate.previewUrl}
        alt={customTemplate.name}
        className="max-h-[480px] w-full rounded-lg border border-slate-200 object-contain"
      />
    )
  }

  if (isPdfFile(customTemplate.fileType)) {
    return (
      <iframe
        title={customTemplate.name}
        src={customTemplate.previewUrl}
        className="h-[480px] w-full rounded-lg border border-slate-200 bg-white"
      />
    )
  }

  if (isDocxFile(customTemplate.fileType)) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">{customTemplate.fileName}</p>
        <p className="mt-2 text-sm text-slate-500">
          DOCX preview is not available yet. Your uploaded format is stored as a reference.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      {customTemplate.fileName} ({customTemplate.fileType})
    </div>
  )
}

function CustomTemplate({ quotationData, customTemplate }) {
  const { quotationDetails, coverLetter, status } = quotationData

  return (
    <div className="space-y-6 text-slate-900">
      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Custom template mode: your uploaded format is shown as a visual reference.
          Field mapping will be added in a future phase.
        </div>

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Uploaded Format Reference
        </h3>
        <FileReferencePreview customTemplate={customTemplate} />
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
