function PublicQuotationLayout({ company, quotationNumber, revision, status, children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name || 'Company logo'}
                className="h-12 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                {(company?.name || 'Q').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {company?.name || 'Quotation'}
              </p>
              <p className="text-xs text-slate-500">Secure quotation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quotation</p>
            <p className="text-lg font-semibold text-slate-900">{quotationNumber || '—'}</p>
            <p className="text-sm capitalize text-slate-500">
              Revision {revision ?? 0}
              {status ? ` · ${status}` : ''}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

export default PublicQuotationLayout
