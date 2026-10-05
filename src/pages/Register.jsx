import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import HoneypotFields from '../components/auth/HoneypotFields'
import { inputClassName, labelClassName } from '../components/quotation/formStyles'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    website: '',
    fax: '',
  })
  const [formStartedAt] = useState(() => Date.now())
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Register — QuoteBuilder'
  }, [])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function handleChange(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        ...form,
        formStartedAt,
      })
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          message: 'Account created successfully. Please log in to continue.',
        },
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to register.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-lg shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">QuoteBuilder</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register your company, then log in to start creating quotations.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="on">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <HoneypotFields
            website={form.website}
            fax={form.fax}
            onWebsiteChange={(value) => setForm((current) => ({ ...current, website: value }))}
            onFaxChange={(value) => setForm((current) => ({ ...current, fax: value }))}
          />

          <div>
            <label htmlFor="name" className={labelClassName}>Full Name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={handleChange('name')}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClassName}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClassName}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange('password')}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
          </div>

          <div>
            <label htmlFor="companyName" className={labelClassName}>Company Name</label>
            <input
              id="companyName"
              required
              value={form.companyName}
              onChange={handleChange('companyName')}
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
