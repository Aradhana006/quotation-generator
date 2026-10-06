import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, company, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {company?.name || 'Your workspace'}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          Create, share, and track quotations
        </p>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="text-sm text-slate-700">
              {user.name || user.email}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
