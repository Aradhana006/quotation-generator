import {
  CompanyHeader,
  CoverLetterPreview,
  CustomerSection,
  MetaGrid,
  QuotationBodyContent,
} from './shared/QuotationSections'

function ProfessionalTemplate({ quotationData }) {
  const { company, customer, quotationDetails, coverLetter, status } = quotationData

  return (
    <div className="space-y-6 text-slate-900">
      <div className="quote-preview-page border-2 border-slate-900 bg-white p-6 sm:p-8">
        <div className="mb-6 border-l-4 border-slate-900 pl-4">
          <CompanyHeader company={company} variant="professional" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MetaGrid
            quotationDetails={quotationDetails}
            status={status}
            showSubject={!coverLetter.enabled}
          />
          <CustomerSection customer={customer} title="Customer Details" />
        </div>

        <CoverLetterPreview coverLetter={coverLetter} company={company} />
      </div>

      <div className="quote-preview-page border border-slate-300 bg-white p-6 sm:p-8">
        <div className="mb-4 border-b-2 border-slate-900 pb-3">
          <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">
            Quotation Schedule
          </h3>
        </div>
        <QuotationBodyContent quotationData={quotationData} />
      </div>
    </div>
  )
}

export default ProfessionalTemplate
