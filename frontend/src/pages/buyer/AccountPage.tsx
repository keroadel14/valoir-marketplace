import { Navigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useAuth } from '@/stores/auth'

export function AccountOverview() {
  const { t } = useI18n()
  const user = useAuth((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">{t.buyer.overview}</h2>
      <p className="text-sm">{user.fullName}</p>
      <p className="text-sm text-[var(--muted)]">{user.email}</p>
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Roles: {user.roles.join(', ')}</p>
    </div>
  )
}
