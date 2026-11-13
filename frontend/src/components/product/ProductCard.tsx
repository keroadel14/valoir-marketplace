import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Check } from 'lucide-react'
import type { ProductListItem } from '@/types'
import { useWishlist } from '@/stores/wishlist'
import { useCart } from '@/stores/cart'
import { clsx } from 'clsx'
import { getProductDisplay } from '@/utils/productImages'

export function ProductCard({ product }: { product: ProductListItem }) {
  const { toggle, has } = useWishlist()
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const saved = has(product.id)
  const display = getProductDisplay(product)
  const title = display.title || product.title
  const brand = display.brand || product.brand

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add({
      productId: product.id,
      title,
      price: product.basePrice,
      quantity: 1,
      imageUrl: display.imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle({ productId: product.id, title, price: product.basePrice })
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden border border-[#B89768]/30 bg-[#121316] p-3 sm:p-4 text-white transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)] dark:border-[#D4AF37]/25 dark:bg-[#0D0E10] dark:hover:border-[#E5C158]">
      {/* Top Bar inside Card: Edition Tag & Wishlist */}
      <div className="relative z-10 mb-2 flex items-center justify-between">
        {product.isFeatured ? (
          <span className="border border-[#D4AF37]/50 bg-[#0B0C0E]/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#E5C158] backdrop-blur-sm">
            EDITION
          </span>
        ) : brand ? (
          <span className="text-[9px] font-light uppercase tracking-[0.25em] text-[#B89768]/90 dark:text-[#D4AF37]/80 truncate max-w-[120px]">
            {brand}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          aria-label="Wishlist"
          onClick={handleWishlist}
          className={clsx(
            'flex h-7 w-7 items-center justify-center border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-200 hover:border-[#D4AF37] hover:scale-110',
            saved ? 'border-[#D4AF37] text-[#E5C158]' : 'text-white/60 hover:text-white',
          )}
        >
          <Heart className={clsx('h-3.5 w-3.5', saved && 'fill-current text-[#E5C158]')} />
        </button>
      </div>

      {/* Centered Product Image */}
      <Link
        to={`/product/${product.slug}`}
        className="relative my-auto block aspect-square w-full overflow-hidden bg-[#0A0A0C] flex items-center justify-center"
      >
        <img
          src={display.imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-20" />
      </Link>

      {/* Bottom Info: Title, Price & Quick Shop Action */}
      <div className="mt-4 pt-3 border-t border-white/10 dark:border-[#D4AF37]/20">
        <Link
          to={`/product/${product.slug}`}
          className="block truncate font-display text-xs sm:text-sm uppercase tracking-[0.16em] text-white/90 transition-colors hover:text-[#E5C158]"
          title={title}
        >
          {title}
        </Link>

        <div className="mt-2.5 flex items-center justify-between">
          <p className="font-sans text-xs sm:text-sm font-light tracking-wider text-[#E5C158]">
            ${product.basePrice.toLocaleString()}
          </p>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={clsx(
              'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300',
              added
                ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                : 'border-[#D4AF37]/40 bg-transparent text-[#E5C158] hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 hover:text-white',
            )}
            title="Quick add to cart"
          >
            {added ? (
              <>
                <Check className="h-3 w-3" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3 w-3" />
                <span>SHOP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
