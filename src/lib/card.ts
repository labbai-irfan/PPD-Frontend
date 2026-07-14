/** Pure card helpers — validation, brand detection and display formatting. */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'unknown'

/** Luhn checksum — true when `digits` is a plausible card number. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = digits.charCodeAt(i) - 48
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/** Infer the card network from the leading digits (IIN ranges). */
export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  // Discover's 6011 prefix overlaps RuPay's 60 — check the more specific one first
  if (/^6011/.test(digits)) return 'discover'
  if (/^(60|65|81|82|508)/.test(digits)) return 'rupay'
  return 'unknown'
}

/** Group digits for display — 4-4-4-4 (max 16), Amex 4-6-5 (max 15). */
export function formatCardNumber(digits: string, brand: CardBrand): string {
  const clean = digits.replace(/\D/g, '').slice(0, brand === 'amex' ? 15 : 16)
  if (brand === 'amex') {
    return [clean.slice(0, 4), clean.slice(4, 10), clean.slice(10, 15)].filter(Boolean).join(' ')
  }
  return clean.match(/.{1,4}/g)?.join(' ') ?? ''
}

/** Parse a strict 'MM/YY' string. `year` is the full year (2000 + YY). */
export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return null
  return { month: Number(match[1]), year: 2000 + Number(match[2]) }
}

/** Valid month (1-12) and not before the current month/year. */
export function expiryValid(value: string, now: Date = new Date()): boolean {
  const parsed = parseExpiry(value)
  if (!parsed || parsed.month < 1 || parsed.month > 12) return false
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  if (parsed.year !== currentYear) return parsed.year > currentYear
  return parsed.month >= currentMonth
}

/** Security-code length for a network — Amex uses 4 digits, everyone else 3. */
export function cvvLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3
}
