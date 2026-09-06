import PageContainer from '../components/PageContainer'
import PlaceholderPanel from '../components/PlaceholderPanel'

function Dashboard() {
  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your quotations and recent activity."
    >
      <PlaceholderPanel message="Dashboard content will go here." />
    </PageContainer>
  )
}

export default Dashboard
