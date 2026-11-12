import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import type { Role } from '@/types'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, hasRole } = useAuth()
  if (!user?.accessToken) return <Navigate to="/login" replace />
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />
  return <Outlet />
}
