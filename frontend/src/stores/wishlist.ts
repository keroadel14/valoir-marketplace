import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishItem {
  productId: string
  title: string
  price: number
  imageUrl?: string
}

interface WishState {
  items: WishItem[]
  toggle: (item: WishItem) => void
  has: (id: string) => boolean
  remove: (id: string) => void
}

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((x) => x.productId === item.productId)
        set({
          items: exists
            ? get().items.filter((x) => x.productId !== item.productId)
            : [...get().items, item],
        })
      },
      has: (id) => get().items.some((x) => x.productId === id),
      remove: (id) => set({ items: get().items.filter((x) => x.productId !== id) }),
    }),
    { name: 'valoir_wishlist' },
  ),
)
