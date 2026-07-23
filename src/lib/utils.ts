import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CURRENCY, LOCALE } from '@/lib/constants'

/** Merge Tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a relative server path like `/uploads/2025/07/uuid.png`
 * into an absolute URL pointing at the backend.
 * If the value is already absolute (http/https/blob/data) it is returned as-is.
 */
const API_ORIGIN = (() => {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) return ''
  try { return new URL(base).origin } catch { return '' }
})()

export function mediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^(https?:|blob:|data:)/.test(path)) return path
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : path
}

const wholeFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** ₹299 for whole amounts, ₹3.20 for fractional ones (matches the design). */
export function formatCurrency(amount: number): string {
  return Number.isInteger(amount) ? wholeFormatter.format(amount) : decimalFormatter.format(amount)
}

/** Percentage off between an original (MRP) and selling price, e.g. 22. */
export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

export function formatDate(iso: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return date.toLocaleDateString(LOCALE, opts ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Simulated network latency for the mock repository layer. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

let idCounter = 0
/** Client-side unique id (orders, toasts, optimistic entities). */
export function uid(prefix = 'id'): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`
}
