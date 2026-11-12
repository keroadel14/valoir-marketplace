import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export function ProductPage() {
  const { slug = '' } = useParams()
  const { t } = useI18n()
  const [qty, setQty] = useState(1)
  const add = useCart((s) => s.add)
  const { toggle, has } = useWishlist()
  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.getBySlug(slug),
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!data) return <div className="container-lux py-20 text-center">{t.shop.noResults}</div>

  return (
    <div className="container-lux py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-square bg-gradient-to-br from-ivory-200 to-charcoal/10 dark:from-charcoal-100 dark:to-charcoal-900" />
        <div>
          {data.brand && <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{data.brand}</p>}
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{data.title}</h1>
          <p className="mt-4 text-2xl">${data.basePrice.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{t.product.seller}: Boutique</p>
          <p className="mt-8 leading-relaxed text-[var(--muted)]">{data.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <label className="text-sm">
              Qty
              <input className="input ml-2 w-20" type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                add({
                  productId: data.id,
                  title: data.title,
                  price: data.basePrice,
                  quantity: qty,
                  boutiqueId: data.boutiqueId,
                  variantId: (data as { variantId?: string }).variantId,
                })
              }
            >
              {t.product.addToCart}
            </Button>
            <Button variant="outline" onClick={() => toggle({ productId: data.id, title: data.title, price: data.basePrice })}>
              {has(data.id) ? '♥' : t.product.addWishlist}
            </Button>
          </div>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Reviews require a verified purchase · eligibility enforced by backend when available.
          </p>
          <Link to="/shop" className="mt-8 inline-block text-sm text-champagne hover:underline">{t.common.back}</Link>
        </div>
      </div>
    </div>
  )
}
