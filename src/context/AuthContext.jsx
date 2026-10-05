import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const isAuthenticated = Boolean(user && company)

  const refreshAuth = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await authService.getCurrentUser()
      setUser(data.user)
      setCompany(data.company)
    } catch {
      setUser(null)
      setCompany(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

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
      setUser(null)
      setCompany(null)
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
