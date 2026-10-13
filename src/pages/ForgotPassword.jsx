import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import HoneypotFields from '../components/auth/HoneypotFields'
import { inputClassName, labelClassName } from '../components/quotation/formStyles'
import { useAuth } from '../context/AuthContext'
import { forgotPassword } from '../services/authService'

function ForgotPassword() {
  const { isAuthenticated, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [fax, setFax] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Forgot password — QuoteBuilder'
  }, [])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await forgotPassword({ email, website, fax })
      setSuccessMessage(
        data?.message ||
          'Password reset link sent. Check your inbox and spam folder.',
      )
    } catch (submitError) {
      setError(submitError.message || 'Unable to start password reset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-lg shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">QuoteBuilder</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your account email and we&apos;ll send a reset link to that inbox.
        </p>

        {successMessage ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              {successMessage}
            </div>

            <p className="text-center text-sm text-slate-600">
              <Link to="/login" className="font-medium text-teal-800 hover:underline">
                Back to log in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Remembered it?{' '}
              <Link to="/login" className="font-medium text-teal-800 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
