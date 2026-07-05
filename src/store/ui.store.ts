import { create } from 'zustand'
import { STORAGE_KEYS } from '@/lib/constants'

export type Theme = 'light' | 'dark' | 'system'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

function initialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEYS.theme)
  // The PPD design ships light-first, so light is the default.
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light'
}

interface UiState {
  theme: Theme
  setTheme: (theme: Theme) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  theme: initialTheme(),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
    applyTheme(theme)
    set({ theme })
  },
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))

// Keep the document class in sync if the OS theme changes while in "system".
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  applyTheme(useUiStore.getState().theme)
})
