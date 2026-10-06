import {
  CompanyHeader,
  CoverLetterPreview,
  CustomerSection,
  MetaGrid,
  QuotationBodyContent,
} from './shared/QuotationSections'

function ModernTemplate({ quotationData }) {
  const { company, customer, quotationDetails, coverLetter, status } = quotationData

  return (
    <div className="space-y-6 text-slate-900">
      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-10">
        <CompanyHeader company={company} variant="modern" />
        <MetaGrid
          quotationDetails={quotationDetails}
          status={status}
          showSubject={!coverLetter.enabled}
        />
        <CustomerSection customer={customer} />
        <CoverLetterPreview coverLetter={coverLetter} company={company} />
      </div>

      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-10">
        <QuotationBodyContent quotationData={quotationData} />
      </div>
    </div>
  )
}

export default ModernTemplate
