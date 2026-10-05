import { useState } from 'react'

function CollapsibleFormSection({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50/80"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {badge && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </section>
  )
}

export default CollapsibleFormSection
