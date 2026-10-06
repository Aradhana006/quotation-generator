function QuotationWizardFooter({
  activeStep,
  isFirst,
  isLast,
  isSaving,
  canEdit,
  onBack,
  onNext,
  onSaveDraft,
  onFinalize,
}) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isLast ? (
            <>
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving || !canEdit}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={onFinalize}
                disabled={isSaving || !canEdit}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Finalize'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canEdit && activeStep !== 'review'}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuotationWizardFooter
