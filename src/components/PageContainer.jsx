function PageContainer({ title, description, children, actions = null }) {
  return (
    <div className="px-6 py-7 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}

export default PageContainer
