import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { apiClient } from '@/services/api/client'
import { useAuthStore } from '@/store/auth.store'

interface WishlistState {
  ids: string[]
  /** Pull the server wishlist (merges into local on login). */
  sync: () => Promise<void>
  toggle: (productId: string) => void
  remove: (productId: string) => void
  clear: () => void
}

/**
 * Local-first wishlist: instant UI updates persisted to localStorage;
 * mirrored to the server in the background when logged in.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      sync: async () => {
        if (!useAuthStore.getState().isAuthenticated) return
        const { data } = await apiClient.get<{ productIds: string[] }>('/wishlist')
        const merged = Array.from(new Set([...get().ids, ...data.productIds]))
        set({ ids: merged })
        // Push any local-only ids up to the server
        const serverSet = new Set(data.productIds)
        for (const id of merged.filter((i) => !serverSet.has(i))) {
          void apiClient.post('/wishlist/toggle', { productId: id }).catch(() => {})
        }
      },

      toggle: (productId) => {
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        }))
        if (useAuthStore.getState().isAuthenticated) {
          void apiClient.post('/wishlist/toggle', { productId }).catch(() => {})
        }
      },

      remove: (productId) => {
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) }))
        if (useAuthStore.getState().isAuthenticated) {
          void apiClient.delete(`/wishlist/${productId}`).catch(() => {})
        }
      },

      clear: () => set({ ids: [] }),
    }),
    { name: STORAGE_KEYS.wishlist },
  ),
)

export function useIsWishlisted(productId: string): boolean {
  return useWishlistStore((s) => s.ids.includes(productId))
}
