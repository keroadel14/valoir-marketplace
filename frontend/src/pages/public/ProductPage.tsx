import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { getProductDisplay } from '@/utils/productImages'
import { ShieldCheck, Truck, Sparkles, Heart, ArrowLeft, ArrowRight } from 'lucide-react'

export function ProductPage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const isAr = lang === 'ar'
  const [qty, setQty] = useState(1)
  const add = useCart((s) => s.add)
  const { toggle, has } = useWishlist()
  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.getBySlug(slug),
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!data) return <div className="container-lux py-20 text-center">{t.shop.noResults}</div>

  const display = getProductDisplay({
    slug: data.slug,
    title: data.title,
    brand: data.brand,
    description: data.description,
  })
  const title = display.title || data.title
  const brand = display.brand || data.brand
  const description = display.description || data.description
  const saved = has(data.id)

  return (
    <div className="container-lux py-12 md:py-20">
      {/* Breadcrumb / Navigation */}
      <div className="mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[#B89768] dark:hover:text-[#D4AF37] transition-colors"
        >
          {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
          <span>{isAr ? 'العودة إلى المعرض' : 'BACK TO CURATION'}</span>
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Editorial Product Image */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-lg dark:border-[#2E2B25]">
            <img
              src={display.imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {data.isFeatured && (
              <span className="absolute start-4 top-4 border border-[#D4AF37]/50 bg-[#121316]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-[#E5C158] backdrop-blur-sm">
                EXCLUSIVE EDITION
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          {brand && (
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[#B89768] dark:text-[#D4AF37]">
              {brand} · ATELIER PIECE
            </p>
          )}

          <h1 className="font-display text-3xl md:text-5xl font-normal leading-[1.15] text-[var(--text)]">
            {title}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-normal text-[var(--text)]">
              ${data.basePrice.toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--muted)]">USD (Tax incl.)</span>
          </div>

          <div className="border-y border-[var(--border)] py-4">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              <span>{isAr ? 'مصنوع يدوياً ومفحوص بواسطة خبراء فالوار' : 'Hand-curated & authenticated by Valoir specialists'}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--muted)] font-light">
            {description}
          </p>

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-[var(--muted)]">{isAr ? 'الكمية' : 'QUANTITY'}</span>
              <input
                className="input w-20 text-center"
                type="number"
                min={1}
                max={10}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="btn-primary flex-1 py-4 text-xs tracking-[0.25em]"
                onClick={() =>
                  add({
                    productId: data.id,
                    title,
                    price: data.basePrice,
                    quantity: qty,
                    boutiqueId: data.boutiqueId,
                    variantId: (data as { variantId?: string }).variantId,
                  })
                }
              >
                {t.product.addToCart.toUpperCase()}
              </Button>
              <button
                type="button"
                className="flex items-center justify-center border border-[var(--border)] px-4 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                onClick={() => toggle({ productId: data.id, title, price: data.basePrice })}
                title="Wishlist"
              >
                <Heart className={`h-5 w-5 ${saved ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[var(--text)]'}`} />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            <div className="flex items-start gap-2.5">
              <Truck className="h-4 w-4 text-[#B89768] dark:text-[#D4AF37] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[var(--text)]">{isAr ? 'شحن خاص مؤمن' : 'Express Courier'}</p>
                <p className="text-[11px] mt-0.5">{isAr ? 'توصيل في صندوق فاخر' : 'Signature gift packaging'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#B89768] dark:text-[#D4AF37] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[var(--text)]">{isAr ? 'شهادة أصالة' : 'Certificate of Origin'}</p>
                <p className="text-[11px] mt-0.5">{isAr ? 'ضمان إرجاع ميسر' : '14-day private return policy'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
