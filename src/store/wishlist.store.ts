import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface WishlistState {
  ids: string[]
  toggle: (productId: string) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),
      remove: (productId) => set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    { name: STORAGE_KEYS.wishlist },
  ),
)

export function useIsWishlisted(productId: string): boolean {
  return useWishlistStore((s) => s.ids.includes(productId))
}
