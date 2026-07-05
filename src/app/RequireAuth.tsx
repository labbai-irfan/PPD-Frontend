import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'

/**
 * Route guard: renders child routes when signed in, otherwise redirects to
 * login and remembers where the user was heading (restored after login).
 */
export default function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname + location.search }} replace />
  }
  return <Outlet />
}
