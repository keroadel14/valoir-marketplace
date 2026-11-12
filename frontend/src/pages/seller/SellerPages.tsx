import { useAuth } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { Navigate } from 'react-router-dom'

export function SellerOverview() {
  const { t } = useI18n()
  const user = useAuth((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">{t.seller.overview}</h2>
      <p className="text-sm">Boutique ID: {user.boutiqueId ?? '—'}</p>
      <p className="text-sm">Status: <span className="text-champagne">{user.boutiqueStatus ?? '—'}</span></p>
      <p className="text-xs text-[var(--muted)]">
        Seller product/order APIs are limited on the current backend. Admin catalog management is available to platform staff.
        Boutique remains restricted until Approved.
      </p>
    </div>
  )
}
