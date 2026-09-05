import { useParams } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'

function QuoteDetailsPage() {
  const { id } = useParams()

  return (
    <PageContainer
      title="Quotation Details"
      description={`Viewing quotation ${id}.`}
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Quotation details and preview will go here.
      </div>
    </PageContainer>
  )
}

export default QuoteDetailsPage
