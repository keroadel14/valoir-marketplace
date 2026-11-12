import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { ProductListItem } from '@/types'
import { useWishlist } from '@/stores/wishlist'
import { clsx } from 'clsx'
import { getProductDisplay } from '@/utils/productImages'

export function ProductCard({ product }: { product: ProductListItem }) {
  const { toggle, has } = useWishlist()
  const saved = has(product.id)
  const display = getProductDisplay(product)
  const title = display.title || product.title
  const brand = display.brand || product.brand

  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 group-hover:border-[#B89768]/60 dark:group-hover:border-[#D4AF37]/60"
      >
        <img
          src={display.imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute start-2 top-2 border border-[#D4AF37]/40 bg-[#121316]/85 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-[#E5C158] backdrop-blur-sm">
            EDITION
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label="Wishlist"
        className={clsx(
          'absolute end-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-[#D4AF37]',
          saved ? 'text-[#D4AF37]' : 'text-[var(--muted)] hover:text-[var(--text)]',
        )}
        onClick={(e) => {
          e.preventDefault()
          toggle({ productId: product.id, title, price: product.basePrice })
        }}
      >
        <Heart className={clsx('h-3.5 w-3.5', saved && 'fill-current')} />
      </button>

      <div className="mt-3.5 flex flex-col space-y-1">
        {brand && (
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#B89768] dark:text-[#D4AF37]">
            {brand}
          </p>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-1 font-display text-base font-normal tracking-wide text-[var(--text)] transition-colors hover:text-[#B89768] dark:hover:text-[#D4AF37]"
        >
          {title}
        </Link>
        <p className="text-xs font-medium tracking-wider text-[var(--muted)]">
          ${product.basePrice.toLocaleString()} USD
        </p>
      </div>
    </article>
  )
}
