import { useI18n } from '@/i18n'
import { useWishlist } from '@/stores/wishlist'
import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'

export function WishlistPage() {
  const { t } = useI18n()
  const { items, remove } = useWishlist()
  if (items.length === 0) {
    return (
      <div className="container-lux py-16">
        <EmptyState title={t.nav.wishlist} hint={t.cart.continue} />
        <div className="text-center"><Link to="/shop" className="text-champagne text-sm">{t.cart.continue}</Link></div>
      </div>
    )
  }
  return (
    <div className="container-lux py-12">
      <h1 className="section-title mb-8">{t.nav.wishlist}</h1>
      <ul className="divide-y divide-[var(--border)]">
        {items.map((i) => (
          <li key={i.productId} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{i.title}</p>
              <p className="text-sm text-[var(--muted)]">${i.price.toLocaleString()}</p>
            </div>
            <button type="button" className="text-sm text-red-600" onClick={() => remove(i.productId)}>
              {t.cart.remove}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
