import { useEffect, useMemo } from 'react'
import { useAppData } from '../../context/AppDataContext'
import { SAMPLE_QUOTATION } from '../../data/sampleQuotation'
import { profileToQuotationSnapshot } from '../../utils/dataMappers'
import QuoteTemplateRenderer from './QuoteTemplateRenderer'

function TemplateViewModal({ template, customTemplates = [], onClose, quotationData }) {
  const { companyProfile } = useAppData()

  useEffect(() => {
    if (!template) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [template, onClose])

  const previewData = useMemo(() => {
    const base = quotationData || SAMPLE_QUOTATION
    const branding = profileToQuotationSnapshot(companyProfile)

    // Prefer live quotation form data; fall back to saved company profile branding.
    return {
      ...base,
      company: {
        ...branding.company,
        ...base.company,
        name: base.company?.name || branding.company.name || '',
        logo: base.company?.logo || branding.company.logo || '',
      },
      bankDetails: {
        ...branding.bankDetails,
        ...base.bankDetails,
      },
      signature: {
        ...branding.signature,
        ...base.signature,
        name: base.signature?.name || branding.signature.name || '',
        designation:
          base.signature?.designation ||
          branding.signature.designation ||
          'Authorised Signatory',
        signatureImage:
          base.signature?.signatureImage || branding.signature.signatureImage || '',
      },
    }
  }, [quotationData, companyProfile])

  if (!template) return null

  const selectedTemplate = { type: template.type, id: template.id }
  const title = template.name || 'Template preview'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
            Template preview
          </p>
          <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-300">
            {template.type === 'custom' ? 'Custom template' : template.description || 'Built-in layout'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-[210mm]">
          <QuoteTemplateRenderer
            selectedTemplate={selectedTemplate}
            quotationData={previewData}
            customTemplates={customTemplates}
          />
        </div>
      </div>
    </div>
  )
}

export default TemplateViewModal
