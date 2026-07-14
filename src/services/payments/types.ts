import type { CartItem } from '@/types'

/**
 * What the payment forms collect. PCI hygiene: the full card number / cvv
 * exists ONLY in the browser — gateways must sanitize before anything is
 * sent to our backend (mock confirm receives just { last4, brand }).
 */
export type PaymentDetails =
  | { method: 'card'; card: { number: string; name: string; expiry: string; cvv: string } }
  | { method: 'upi'; vpa: string }
  | { method: 'netbanking'; bank: string }

export interface PaymentResult {
  intentId: string
  transactionId: string
}

export type PaymentErrorCode = 'declined' | 'network' | 'cancelled'

export class PaymentError extends Error {
  code: PaymentErrorCode

  constructor(code: PaymentErrorCode, message: string) {
    super(message)
    this.name = 'PaymentError'
    this.code = code
  }
}

export interface PaymentGateway {
  pay(input: { details: PaymentDetails; items: CartItem[]; couponCode?: string }): Promise<PaymentResult>
}

/** Shape returned by POST /payments/intent. */
export interface PaymentIntent {
  intentId: string
  amount: number
  currency: string
  provider: 'mock' | 'razorpay'
  providerOrderId: string | null
  keyId: string | null
}

/**
 * Normalize any thrown value into a PaymentError. Server-provided messages
 * (the api client already unwraps them) are kept; generic transport errors
 * become a friendly network message.
 */
export function toPaymentError(error: unknown): PaymentError {
  if (error instanceof PaymentError) return error
  const raw = error instanceof Error ? error.message : ''
  const isGeneric = !raw || /network error|timeout of|request failed/i.test(raw)
  return new PaymentError(
    'network',
    isGeneric ? 'We could not reach the payment service. Please check your connection and try again.' : raw,
  )
}
