import PageContainer from '../components/PageContainer'
import PlaceholderPanel from '../components/PlaceholderPanel'

function Customers() {
  return (
    <PageContainer
      title="Customers"
      description="Manage your customer records."
    >
      <PlaceholderPanel message="Customer list will go here." />
    </PageContainer>
  )
}

export default Customers
