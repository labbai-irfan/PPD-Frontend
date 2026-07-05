import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { sleep, uid } from '@/lib/utils'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  /** Mock credential check — replace with an apiClient call when backend exists. */
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, _password) => {
        await sleep(600)
        const name = email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
        const user: User = {
          id: uid('user'),
          name: name || 'Shopora User',
          email,
          createdAt: new Date().toISOString(),
        }
        set({ user, token: uid('token'), isAuthenticated: true })
        return user
      },

      register: async (name, email, _password) => {
        await sleep(700)
        const user: User = { id: uid('user'), name, email, createdAt: new Date().toISOString() }
        set({ user, token: uid('token'), isAuthenticated: true })
        return user
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: STORAGE_KEYS.auth },
  ),
)
