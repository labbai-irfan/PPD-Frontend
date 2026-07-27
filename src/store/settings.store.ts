import { create } from 'zustand'
import { apiClient } from '@/services/api/client'

export interface PublicSettings {
  siteName: string
  currency: string
  freeShippingThreshold: number
  shippingFee: number
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  facebookUrl: string
  instagramUrl: string
}

interface SettingsState {
  settings: PublicSettings | null
  fetchSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,
  fetchSettings: async () => {
    try {
      const { data } = await apiClient.get<PublicSettings>('/settings')
      set({ settings: data })
    } catch (e) {
      console.error('Failed to load settings', e)
    }
  },
}))
