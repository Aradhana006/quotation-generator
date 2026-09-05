import PageContainer from '../components/layout/PageContainer'
import QuotationEditor from '../components/quotation/QuotationEditor'

function CreateQuotationPage() {
  return (
    <PageContainer
      title="Create Quotation"
      description="Build a new quotation with live preview."
    >
      <QuotationEditor />
    </PageContainer>
  )
}

export default CreateQuotationPage
