import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import HoneypotFields from '../components/auth/HoneypotFields'
import { inputClassName, labelClassName } from '../components/quotation/formStyles'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const registeredMessage = location.state?.registered
    ? location.state.message || 'Account created successfully. Please log in to continue.'
    : ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [website, setWebsite] = useState('')
  const [fax, setFax] = useState('')
  const [formStartedAt] = useState(() => Date.now())
  const [error, setError] = useState('')
  const [info] = useState(registeredMessage)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Log in — QuoteBuilder'
  }, [])

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password, website, fax, formStartedAt })
      navigate(from, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Unable to log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-lg shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">QuoteBuilder</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-500">Access your quotation workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {info && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              {info}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <HoneypotFields
            website={website}
            fax={fax}
            onWebsiteChange={setWebsite}
            onFaxChange={setFax}
          />

          <div>
            <label htmlFor="email" className={labelClassName}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClassName}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-teal-800 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
