import PageContainer from '../components/layout/PageContainer'

function CustomersPage() {
  return (
    <PageContainer
      title="Customers"
      description="Manage your customer records."
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Customer list will go here.
      </div>
    </PageContainer>
  )
}

export default CustomersPage
