import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { ProductListItem } from '@/types'
import { useWishlist } from '@/stores/wishlist'
import { clsx } from 'clsx'

export function ProductCard({ product }: { product: ProductListItem }) {
  const { toggle, has } = useWishlist()
  const saved = has(product.id)
  return (
    <article className="group relative flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-[var(--border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-ivory-200 to-charcoal/10 dark:from-charcoal-100 dark:to-charcoal-900" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-4xl text-charcoal/20 dark:text-white/10">
          {product.title.charAt(0)}
        </div>
        {product.isFeatured && (
          <span className="absolute start-3 top-3 bg-champagne px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-charcoal">
            Featured
          </span>
        )}
      </Link>
      <button
        type="button"
        aria-label="Wishlist"
        className={clsx(
          'absolute end-3 top-3 rounded-full bg-white/90 p-2 shadow-soft transition dark:bg-charcoal-100',
          saved && 'text-champagne',
        )}
        onClick={() =>
          toggle({ productId: product.id, title: product.title, price: product.basePrice })
        }
      >
        <Heart className={clsx('h-4 w-4', saved && 'fill-current')} />
      </button>
      <div className="mt-3 space-y-1">
        {product.brand && <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">{product.brand}</p>}
        <Link to={`/product/${product.slug}`} className="font-medium leading-snug hover:text-champagne">
          {product.title}
        </Link>
        <p className="text-sm">${product.basePrice.toLocaleString()}</p>
      </div>
    </article>
  )
}
