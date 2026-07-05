import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { uid } from '@/lib/utils'
import type { Address } from '@/types'

interface AddressState {
  addresses: Address[]
  add: (address: Omit<Address, 'id'>) => Address
  update: (id: string, patch: Partial<Omit<Address, 'id'>>) => void
  remove: (id: string) => void
  setDefault: (id: string) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],

      add: (input) => {
        const address: Address = { ...input, id: uid('addr') }
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) => (address.isDefault ? { ...a, isDefault: false } : a)),
            state.addresses.length === 0 ? { ...address, isDefault: true } : address,
          ],
        }))
        return address
      },

      update: (id, patch) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      remove: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== id)
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0] = { ...remaining[0], isDefault: true }
          }
          return { addresses: remaining }
        }),

      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),
    }),
    { name: STORAGE_KEYS.addresses },
  ),
)
