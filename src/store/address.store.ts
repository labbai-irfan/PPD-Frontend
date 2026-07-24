import { create } from 'zustand'
import { apiClient } from '@/services/api/client'
import type { Address } from '@/types'

interface AddressState {
  addresses: Address[]
  loaded: boolean
  fetchAddresses: () => Promise<void>
  add: (address: Omit<Address, 'id'>) => Promise<Address>
  update: (id: string, patch: Partial<Omit<Address, 'id'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
}

/** API-backed address book (backend enforces default rules). */
export const useAddressStore = create<AddressState>()((set) => ({
  addresses: [],
  loaded: false,

  fetchAddresses: async () => {
    const { data } = await apiClient.get<Address[]>('/addresses')
    set({ addresses: data, loaded: true })
  },

  add: async (input) => {
    const { data } = await apiClient.post<Address>('/addresses', {
      name: input.name,
      phone: input.phone,
      country: input.country ?? 'India',
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      type: input.type ?? 'home',
      isDefault: input.isDefault ?? false,
    })
    // Refetch keeps default flags consistent with the server
    const { data: all } = await apiClient.get<Address[]>('/addresses')
    set({ addresses: all, loaded: true })
    return data
  },

  update: async (id, patch) => {
    await apiClient.patch(`/addresses/${id}`, patch)
    const { data } = await apiClient.get<Address[]>('/addresses')
    set({ addresses: data })
  },

  remove: async (id) => {
    await apiClient.delete(`/addresses/${id}`)
    const { data } = await apiClient.get<Address[]>('/addresses')
    set({ addresses: data })
  },

  setDefault: async (id) => {
    await apiClient.post(`/addresses/${id}/default`)
    const { data } = await apiClient.get<Address[]>('/addresses')
    set({ addresses: data })
  },
}))
