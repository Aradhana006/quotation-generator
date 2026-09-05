import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quotations', label: 'Quotations' },
  { to: '/quotations/new', label: 'Create Quotation' },
  { to: '/customers', label: 'Customers' },
  { to: '/templates', label: 'Templates' },
  { to: '/settings/company', label: 'Company Settings' },
]

function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quotation Generator
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          QuoteBuilder
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
