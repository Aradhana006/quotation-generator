function FormSection({ title, description, children, compact = false }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className={compact ? 'mb-3' : 'mb-4'}>
        <h2 className={`font-semibold tracking-tight text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-0.5 text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

export default FormSection
