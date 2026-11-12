import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useCart } from '@/stores/cart'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const { t } = useI18n()
  const { items, remove, updateQty, subtotal } = useCart()
  if (items.length === 0) {
    return (
      <div className="container-lux py-16">
        <EmptyState title={t.cart.empty} />
        <div className="text-center"><Link to="/shop"><Button>{t.cart.continue}</Button></Link></div>
      </div>
    )
  }
  return (
    <div className="container-lux py-12">
      <h1 className="section-title mb-8">{t.cart.title}</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-[var(--border)]">
          {items.map((i) => (
            <li key={`${i.productId}-${i.variantId}`} className="flex flex-wrap items-center justify-between gap-4 py-6">
              <div>
                <p className="font-medium">{i.title}</p>
                <p className="text-sm text-[var(--muted)]">${i.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <input className="input w-20" type="number" min={1} value={i.quantity} onChange={(e) => updateQty(i.productId, Number(e.target.value), i.variantId)} />
                <button type="button" className="text-sm text-red-600" onClick={() => remove(i.productId, i.variantId)}>{t.cart.remove}</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="card h-fit space-y-4 p-6">
          <div className="flex justify-between text-sm">
            <span>{t.cart.subtotal}</span>
            <span className="font-medium">${subtotal().toLocaleString()}</span>
          </div>
          <p className="text-xs text-[var(--muted)]">Final totals, taxes, and payment are confirmed by the backend at checkout.</p>
          <Link to="/checkout"><Button className="w-full">{t.cart.checkout}</Button></Link>
        </div>
      </div>
    </div>
  )
}
