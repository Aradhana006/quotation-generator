import PageContainer from '../components/layout/PageContainer'

function CompanySettingsPage() {
  return (
    <PageContainer
      title="Company Settings"
      description="Configure your business details, branding, and bank information."
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Company settings form will go here.
      </div>
    </PageContainer>
  )
}

export default CompanySettingsPage
