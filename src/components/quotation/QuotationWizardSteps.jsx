export const WIZARD_STEPS = [
  { id: 'basics', label: 'Basics', hint: 'Template, dates & customer' },
  { id: 'items', label: 'Items', hint: 'Line items & pricing' },
  { id: 'terms', label: 'Terms', hint: 'Notes, terms & company' },
  { id: 'review', label: 'Review', hint: 'Preview & save' },
]

function QuotationWizardSteps({ activeStep, onStepChange, maxReachableIndex = 0 }) {
  const activeIndex = WIZARD_STEPS.findIndex((step) => step.id === activeStep)

  return (
    <nav
      className="border-b border-slate-200/80 bg-white px-4 sm:px-6"
      aria-label="Quotation wizard steps"
    >
      <ol className="flex gap-1 overflow-x-auto py-3">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = step.id === activeStep
          const isComplete = index < activeIndex
          const isReachable = index <= maxReachableIndex
          const canClick = isReachable && !isActive

          return (
            <li key={step.id} className="min-w-[9.5rem] flex-1">
              <button
                type="button"
                disabled={!canClick}
                onClick={() => {
                  if (canClick) onStepChange(step.id)
                }}
                className={[
                  'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
                  isActive ? 'bg-teal-50 ring-1 ring-teal-200' : '',
                  canClick ? 'hover:bg-slate-50' : '',
                  !isReachable ? 'cursor-not-allowed opacity-50' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-teal-700 text-white'
                      : isComplete
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-600',
                  ].join(' ')}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={[
                      'block text-sm font-medium',
                      isActive ? 'text-slate-900' : 'text-slate-700',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{step.hint}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default QuotationWizardSteps
