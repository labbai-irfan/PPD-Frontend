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

/**
 * Requests that legitimately return 401 as a *credential* failure, not an
 * expired session. These must never trigger the silent refresh-and-redirect
 * flow, or the real "Invalid email or password" error gets swallowed.
 */
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/admin/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
]

const isAuthEndpoint = (url?: string) => !!url && AUTH_ENDPOINTS.some((p) => url.includes(p))

/** An Error that also carries the HTTP status, so callers can branch on it. */
export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

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

    // A 401 from a login/register/refresh call is a credential failure — let it
    // fall through to the message handler below so the UI can show it. Only an
    // *authenticated* request (one that carried a token) should try to refresh.
    const hadToken = Boolean(originalRequest?.headers?.Authorization)

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url) &&
      hadToken
    ) {
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

    // Build a user-facing message. NestJS puts a user-safe string (from thrown
    // HttpExceptions) or a string[] (from the validation pipe) on `message`.
    // Both are safe to surface; only network/5xx errors get a generic fallback.
    const status = error.response?.status
    const responseData = error?.response?.data as any
    let message: string

    if (error.code === 'ECONNABORTED') {
      message = 'The request timed out. Please check your connection and try again.'
    } else if (!error.response) {
      message = 'Cannot reach the server. Please check your connection and try again.'
    } else if (status && status >= 500) {
      message = 'Something went wrong on our end. Please try again in a moment.'
    } else if (Array.isArray(responseData?.message)) {
      // class-validator returns every failed rule; show the first, clearest one
      message = String(responseData.message[0])
    } else if (typeof responseData?.message === 'string' && responseData.message) {
      message = responseData.message
    } else if (typeof responseData?.error === 'string' && responseData.error) {
      message = responseData.error
    } else {
      message = 'Something went wrong. Please try again.'
    }

    return Promise.reject(new ApiError(message, status))
  },
)
