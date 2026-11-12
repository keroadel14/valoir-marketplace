import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { getProductImage } from '@/utils/productImages'

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

  const saved = has(data.id)
  const imageUrl = getProductImage(data.slug, data.title)

  return (
    <div className="container-lux py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-[var(--border)] shadow-soft">
          <img
            src={imageUrl}
            alt={data.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          {data.brand && <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{data.brand}</p>}
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{data.title}</h1>
          <p className="mt-4 text-2xl font-semibold">${data.basePrice.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{t.product.seller}: Boutique</p>
          <p className="mt-8 leading-relaxed text-[var(--muted)]">{data.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <label className="text-sm">
              Qty
              <input
                className="input ml-2 w-20"
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            </label>
            <Button
              onClick={() => {
                const variantId = (data as { variantId?: string }).variantId
                add({
                  productId: data.id,
                  variantId,
                  title: data.title,
                  price: data.basePrice,
                  quantity: qty,
                })
              }}
            >
              {t.product.addToCart}
            </Button>
            <Button
              variant="outline"
              onClick={() => toggle({ productId: data.id, title: data.title, price: data.basePrice })}
            >
              {saved ? '♥' : t.product.addWishlist}
            </Button>
          </div>

          <div className="mt-12 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)]">
            <Link to="/shop" className="hover:text-champagne">← {t.common.back}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
