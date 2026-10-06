import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import CompanyProfileForm from '../components/company/CompanyProfileForm'
import { useAppData } from '../context/AppDataContext'

function CompanySettings() {
  const {
    companyProfile,
    companyLoading,
    companyError,
    saveCompanyProfile,
    updateCompanyProfile,
    updateCompanyBankField,
    updateCompanySignatoryField,
  } = useAppData()

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  async function handleSave() {
    setIsSaving(true)
    setSaveMessage('')
    try {
      await saveCompanyProfile(companyProfile)
      setSaveMessage('Company profile saved successfully.')
    } catch (error) {
      setSaveMessage(error.message || 'Unable to save company profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (companyLoading) {
    return (
      <PageContainer title="Company Settings">
        <p className="text-sm text-slate-500">Loading company profile...</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Company Settings"
      description="Manage your reusable company profile used across quotations."
    >
      {companyError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {companyError}
        </div>
      )}

      <CompanyProfileForm
        profile={companyProfile}
        onProfileChange={updateCompanyProfile}
        onBankChange={updateCompanyBankField}
        onSignatoryChange={updateCompanySignatoryField}
      />

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Company Profile'}
        </button>
        {saveMessage && (
          <p className={`text-sm ${saveMessage.includes('Unable') ? 'text-red-600' : 'text-green-700'}`}>
            {saveMessage}
          </p>
        )}
      </div>
    </PageContainer>
  )
}

export default CompanySettings
