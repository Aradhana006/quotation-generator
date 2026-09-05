import { Navigate, Outlet } from 'react-router-dom'

/**
 * Placeholder for future authentication.
 * Currently passes all requests through unchanged.
 */
function ProtectedRoute() {
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
