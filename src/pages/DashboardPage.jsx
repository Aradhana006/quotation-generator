import PageContainer from '../components/layout/PageContainer'

function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your quotations and recent activity."
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Dashboard content will go here.
      </div>
    </PageContainer>
  )
}

export default DashboardPage
