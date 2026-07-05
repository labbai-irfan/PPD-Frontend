import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

const MAX_ITEMS = 12

interface RecentlyViewedState {
  ids: string[]
  add: (productId: string) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      add: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS),
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: STORAGE_KEYS.recentlyViewed },
  ),
)
