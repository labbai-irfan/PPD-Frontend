import { apiClient } from '@/services/api/client'
import type { CartItem } from '@/types'
import {
  PaymentError,
  toPaymentError,
  type PaymentDetails,
  type PaymentGateway,
  type PaymentIntent,
  type PaymentResult,
} from '@/services/payments/types'

/** Simulated bank processing time so the mock flow feels real. */
const PROCESSING_DELAY_MS = 1800

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Tiny prefix-based brand detection — runs in the browser only. */
function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  if (/^(60|65|81|82|508)/.test(digits)) return 'RuPay'
  return 'Card'
}

/**
 * PCI hygiene: the full PAN / cvv NEVER leaves the browser to our backend.
 * Confirm receives only { last4, brand } for cards; vpa / bank pass through.
 */
function sanitizeDetails(details: PaymentDetails): Record<string, unknown> {
  // Gateway-driven payments carry no instrument details to sanitize.
  if ('gateway' in details) return {}
  switch (details.method) {
    case 'card': {
      const digits = details.card.number.replace(/\D/g, '')
      return { card: { last4: digits.slice(-4), brand: detectCardBrand(digits) } }
    }
    case 'upi':
      return { vpa: details.vpa }
    case 'netbanking':
      return { bank: details.bank }
  }
}

interface ConfirmResponse {
  intentId: string
  status: 'paid'
  transactionId: string
}

export class MockGateway implements PaymentGateway {
  async pay(input: { details: PaymentDetails; items: CartItem[]; couponCode?: string }): Promise<PaymentResult> {
    try {
      const { data: intent } = await apiClient.post<PaymentIntent>('/payments/intent', {
        items: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selections: item.selections ?? {},
        })),
        method: input.details.method,
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      })

      await wait(PROCESSING_DELAY_MS)

      // Let 402 resolve (instead of rejecting through the interceptor) so the
      // server's decline message can be surfaced as PaymentError('declined').
      const response = await apiClient.post<ConfirmResponse>(
        `/payments/intent/${intent.intentId}/confirm`,
        sanitizeDetails(input.details),
        { validateStatus: (status) => (status >= 200 && status < 300) || status === 402 },
      )

      if (response.status === 402) {
        const body = response.data as unknown as { message?: string }
        throw new PaymentError('declined', body?.message ?? 'Payment was declined by your bank')
      }

      return { intentId: response.data.intentId, transactionId: response.data.transactionId }
    } catch (error) {
      throw toPaymentError(error)
    }
  }
}
