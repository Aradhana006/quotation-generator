const TABS = [
  { id: 'basics', label: 'Basics', hint: 'Template, dates & customer' },
  { id: 'items', label: 'Items & Pricing', hint: 'Line items & totals' },
  { id: 'terms', label: 'Terms & Notes', hint: 'Payment, delivery & terms' },
  { id: 'company', label: 'Company', hint: 'Letterhead & signatures' },
]

function QuotationFormTabs({ activeTab, onTabChange }) {
  return (
    <nav
      className="border-b border-slate-200 bg-white px-6"
      aria-label="Quotation form sections"
    >
      <div className="flex gap-1 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-left transition ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <span className="block text-sm font-medium">{tab.label}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{tab.hint}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { TABS }
export default QuotationFormTabs
