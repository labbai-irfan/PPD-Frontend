import { Navigate, Outlet } from 'react-router-dom'
import { isAdminRole, useAuthStore } from '@/store/auth.store'

export default function AdminGuard() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated || !isAdminRole(user)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
