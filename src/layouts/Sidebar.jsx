import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quotations', label: 'Quotations' },
  { to: '/quotations/create', label: 'Create Quotation' },
  { to: '/customers', label: 'Customers' },
  { to: '/products', label: 'Products & Services' },
  { to: '/templates', label: 'Templates' },
  { to: '/settings/company', label: 'Company Settings' },
]

function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-[#0f1f24] text-slate-100">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-300/90">
          Quotation Generator
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
          QuoteBuilder
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-500/20 text-white shadow-sm ring-1 ring-teal-400/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
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
