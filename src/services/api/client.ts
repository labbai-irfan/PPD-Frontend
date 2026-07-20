import axios, { AxiosError } from 'axios'
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

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((item) => {
    if (token) {
      item.resolve(token)
    } else {
      item.reject(error)
    }
  })
  failedQueue = []
}

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
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        const raw = localStorage.getItem(STORAGE_KEYS.auth)
        const refreshToken: string | undefined = raw ? JSON.parse(raw)?.state?.refreshToken : undefined

        if (!refreshToken) {
          // Don't expose token availability to console
          throw new Error('Session expired')
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth/refresh`,
          { refreshToken },
        )

        const newAccessToken = data.token || data.accessToken
        const auth = JSON.parse(raw || '{}')
        auth.state = { ...auth.state, token: newAccessToken, refreshToken: data.refreshToken || refreshToken }
        localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth))

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        isRefreshing = false

        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, undefined)
        isRefreshing = false

        localStorage.removeItem(STORAGE_KEYS.auth)
        window.location.href = '/auth/login'

        // Don't expose error details in console
        return Promise.reject(new Error('Session expired'))
      }
    }

    // Extract error message safely without exposing technical details
    let message = 'Something went wrong. Please try again.'
    const responseData = error?.response?.data as any

    // Only trust certain error messages from server
    if (responseData?.message && typeof responseData.message === 'string') {
      // Sanitize: only expose user-safe messages
      const safeMessages = ['Invalid email or password', 'Account not found', 'Access denied'];
      if (safeMessages.some(safe => responseData.message.includes(safe))) {
        message = responseData.message
      }
    }

    return Promise.reject(new Error(message))
  },
)
