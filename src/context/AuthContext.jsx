import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService.js'
import { setUnauthorizedHandler } from '../services/apiClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const handlingUnauthorized = useRef(false)

  const isAuthenticated = Boolean(user && company)

  const clearAuthState = useCallback(() => {
    setUser(null)
    setCompany(null)
  }, [])

  const refreshAuth = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await authService.getCurrentUser()
      setUser(data.user)
      setCompany(data.company)
    } catch {
      clearAuthState()
    } finally {
      setIsLoading(false)
    }
  }, [clearAuthState])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (handlingUnauthorized.current) return
      handlingUnauthorized.current = true
      clearAuthState()
      setError('Your session expired. Please log in again.')
      navigate('/login', { replace: true })
      window.setTimeout(() => {
        handlingUnauthorized.current = false
      }, 500)
    })

    return () => setUnauthorizedHandler(null)
  }, [clearAuthState, navigate])

  async function login(credentials) {
    setError('')
    const data = await authService.login(credentials)
    setUser(data.user)
    setCompany(data.company)
    return data
  }

  async function register(payload) {
    setError('')
    // Registration no longer creates a session — user must log in next.
    return authService.register(payload)
  }

  async function logout() {
    setError('')
    try {
      await authService.logout()
    } finally {
      clearAuthState()
    }
  }

  const value = useMemo(
    () => ({
      user,
      company,
      isAuthenticated,
      isLoading,
      error,
      setError,
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, company, isAuthenticated, isLoading, error, refreshAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
