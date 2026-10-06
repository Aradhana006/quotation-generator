import {
  CompanyHeader,
  CoverLetterPreview,
  CustomerSection,
  MetaGrid,
  QuotationBodyContent,
} from './shared/QuotationSections'

function ClassicTemplate({ quotationData }) {
  const { company, customer, quotationDetails, coverLetter, status } = quotationData

  return (
    <div className="space-y-6 font-serif text-slate-900">
      <div className="quote-preview-page border border-slate-400 bg-white p-5 sm:p-7">
        <CompanyHeader company={company} variant="classic" />
        <MetaGrid
          quotationDetails={quotationDetails}
          status={status}
          showSubject={!coverLetter.enabled}
        />
        <CustomerSection customer={customer} title="To" />
        <CoverLetterPreview coverLetter={coverLetter} company={company} />
      </div>

      <div className="quote-preview-page border border-slate-400 bg-white p-5 sm:p-7">
        <h3 className="mb-4 border-b border-slate-400 pb-2 text-center text-base font-bold uppercase">
          Quotation
        </h3>
        <QuotationBodyContent quotationData={quotationData} compact />
      </div>
    </div>
  )
}

export default ClassicTemplate
