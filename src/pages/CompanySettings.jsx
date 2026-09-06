import PageContainer from '../components/PageContainer'
import CompanyProfileForm from '../components/company/CompanyProfileForm'
import { useAppData } from '../context/AppDataContext'

function CompanySettings() {
  const {
    companyProfile,
    updateCompanyProfile,
    updateCompanyBankField,
    updateCompanySignatoryField,
  } = useAppData()

  return (
    <PageContainer
      title="Company Settings"
      description="Manage your reusable company profile used across quotations."
    >
      <CompanyProfileForm
        profile={companyProfile}
        onProfileChange={updateCompanyProfile}
        onBankChange={updateCompanyBankField}
        onSignatoryChange={updateCompanySignatoryField}
      />
    </PageContainer>
  )
}

export default CompanySettings
