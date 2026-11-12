import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string, variantId?: string) => void
  updateQty: (productId: string, qty: number, variantId?: string) => void
  clear: () => void
  count: () => number
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const items = [...get().items]
        const i = items.findIndex(
          (x) => x.productId === item.productId && x.variantId === item.variantId,
        )
        if (i >= 0) {
          items[i] = { ...items[i], quantity: items[i].quantity + item.quantity }
        } else items.push(item)
        set({ items })
      },
      remove: (productId, variantId) =>
        set({
          items: get().items.filter(
            (x) => !(x.productId === productId && x.variantId === variantId),
          ),
        }),
      updateQty: (productId, qty, variantId) =>
        set({
          items: get().items.map((x) =>
            x.productId === productId && x.variantId === variantId
              ? { ...x, quantity: Math.max(1, qty) }
              : x,
          ),
        }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    { name: 'valoir_cart' },
  ),
)
