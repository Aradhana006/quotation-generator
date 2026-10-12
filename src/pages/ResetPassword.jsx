import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import HoneypotFields from '../components/auth/HoneypotFields'
import { inputClassName, labelClassName } from '../components/quotation/formStyles'
import { useAuth } from '../context/AuthContext'
import { resetPassword, validateResetToken } from '../services/authService'

function ResetPassword() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [website, setWebsite] = useState('')
  const [fax, setFax] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [error, setError] = useState('')
  const [isCheckingToken, setIsCheckingToken] = useState(Boolean(token))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Reset password — QuoteBuilder'
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkToken() {
      if (!token) {
        setTokenError('This reset link is missing a token.')
        setIsCheckingToken(false)
        return
      }

      setIsCheckingToken(true)
      setTokenError('')

      try {
        const result = await validateResetToken(token)
        if (!cancelled) {
          setEmailHint(result?.email || '')
        }
      } catch (checkError) {
        if (!cancelled) {
          setTokenError(checkError.message || 'This reset link is invalid or has expired.')
        }
      } finally {
        if (!cancelled) setIsCheckingToken(false)
      }
    }

    checkToken()
    return () => {
      cancelled = true
    }
  }, [token])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, password, website, fax })
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          message: 'Password updated. Please log in with your new password.',
        },
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-lg shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">QuoteBuilder</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">
          {emailHint
            ? `Choose a new password for ${emailHint}.`
            : 'Choose a new password for your account.'}
        </p>

        {isCheckingToken ? (
          <p className="mt-6 text-sm text-slate-500">Checking reset link…</p>
        ) : tokenError ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {tokenError}
            </div>
            <p className="text-center text-sm text-slate-600">
              <Link to="/forgot-password" className="font-medium text-teal-800 hover:underline">
                Request a new reset link
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
              <label htmlFor="password" className={labelClassName}>New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClassName}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>

            <p className="text-center text-sm text-slate-600">
              <Link to="/login" className="font-medium text-teal-800 hover:underline">
                Back to log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
