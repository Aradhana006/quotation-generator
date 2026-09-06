import { useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import PlaceholderPanel from '../components/PlaceholderPanel'

function QuoteDetails() {
  const { id } = useParams()

  return (
    <PageContainer
      title="Quotation Details"
      description={`Viewing quotation ${id}.`}
    >
      <PlaceholderPanel message="Quotation details and preview will go here." />
    </PageContainer>
  )
}

export default QuoteDetails
