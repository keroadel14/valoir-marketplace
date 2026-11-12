import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { ProductListItem } from '@/types'
import { useWishlist } from '@/stores/wishlist'
import { clsx } from 'clsx'
import { getProductImage } from '@/utils/productImages'

export function ProductCard({ product }: { product: ProductListItem }) {
  const { toggle, has } = useWishlist()
  const saved = has(product.id)
  const imageUrl = getProductImage(product.slug, product.title)

  return (
    <article className="group relative flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[var(--border)]">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute start-3 top-3 bg-champagne px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-charcoal shadow-sm">
            Featured
          </span>
        )}
      </Link>
      <button
        type="button"
        aria-label="Wishlist"
        className={clsx(
          'absolute end-3 top-3 rounded-full bg-white/90 p-2 shadow-soft transition dark:bg-charcoal-100 dark:text-white',
          saved && '!text-champagne',
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
        <p className="text-sm font-semibold">${product.basePrice.toLocaleString()}</p>
      </div>
    </article>
  )
}
