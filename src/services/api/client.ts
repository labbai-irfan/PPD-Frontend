import axios from 'axios'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * Central HTTP client. The app currently runs on the mock repository layer
 * (src/services/repositories); when a real backend is ready, point
 * VITE_API_BASE_URL at it and swap repository internals to use this client —
 * no screen or hook changes required.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth)
    const token: string | undefined = raw ? JSON.parse(raw)?.state?.token : undefined
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // ignore malformed storage
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error?.response?.data?.message ?? error?.message ?? 'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  },
)
