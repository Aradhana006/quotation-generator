import ClassicTemplate from './ClassicTemplate'
import CustomTemplate from './CustomTemplate'
import ModernTemplate from './ModernTemplate'
import ProfessionalTemplate from './ProfessionalTemplate'

function QuoteTemplateRenderer({ selectedTemplate, quotationData, customTemplates }) {
  if (selectedTemplate.type === 'custom') {
    const customTemplate = customTemplates.find((item) => item.id === selectedTemplate.id)

    if (!customTemplate) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          The selected custom template could not be found. Please choose another template.
        </div>
      )
    }

    return (
      <CustomTemplate quotationData={quotationData} customTemplate={customTemplate} />
    )
  }

  switch (selectedTemplate.id) {
    case 'professional':
      return <ProfessionalTemplate quotationData={quotationData} />
    case 'classic':
      return <ClassicTemplate quotationData={quotationData} />
    case 'modern':
    default:
      return <ModernTemplate quotationData={quotationData} />
  }
}

export default QuoteTemplateRenderer
