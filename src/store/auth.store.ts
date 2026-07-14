import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { apiClient } from '@/services/api/client'
import type { User } from '@/types'

interface AuthUser extends User {
  role?: 'customer' | 'moderator' | 'admin' | 'super_admin'
}

interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  /** Admin portal login — hits /admin/auth/login (customers rejected server-side). */
  adminLogin: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
        set({
          user: data.user,
          token: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
        return data.user
      },

      register: async (name, email, password) => {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', { name, email, password })
        set({
          user: data.user,
          token: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
        return data.user
      },

      adminLogin: async (email, password) => {
        const { data } = await apiClient.post<AuthResponse>('/admin/auth/login', { email, password })
        set({
          user: data.user,
          token: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
        return data.user
      },

      logout: () => {
        const token = get().token
        if (token) void apiClient.post('/auth/logout').catch(() => {})
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      updateUser: (partialUser) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...partialUser } })
        }
      },
    }),
    { name: STORAGE_KEYS.auth },
  ),
)

/** True when the persisted session belongs to an admin-capable role. */
export function isAdminRole(user: AuthUser | null): boolean {
  return !!user?.role && user.role !== 'customer'
}
