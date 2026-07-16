import { apiClient } from '@/services/api/client'
import { useAuthStore } from '@/store/auth.store'
import type { CartItem } from '@/types'
import {
  PaymentError,
  toPaymentError,
  type OnlineMethod,
  type PaymentDetails,
  type PaymentGateway,
  type PaymentIntent,
  type PaymentResult,
} from '@/services/payments/types'

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayFailedResponse {
  error?: { description?: string; reason?: string }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  image?: string
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  /** Disabled — failures surface in our own payment UI, not an in-modal retry. */
  retry?: { enabled: boolean }
  /** Checkout Customization API — show only the method chosen at checkout. */
  config?: {
    display: {
      blocks: Record<string, { name: string; instruments: Array<{ method: OnlineMethod }> }>
      sequence: string[]
      preferences: { show_default_blocks: boolean }
    }
  }
}

interface RazorpayInstance {
  open: () => void
  close: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayFailedResponse) => void) => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<void> | null = null

/** Load checkout.js exactly once (cached promise; reset on failure so a retry can reload). */
function loadRazorpayScript(): Promise<void> {
  if (typeof window.Razorpay !== 'undefined') return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = RAZORPAY_SCRIPT_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        scriptPromise = null
        script.remove()
        reject(
          new PaymentError(
            'network',
            'Could not load the secure payment window. Please check your connection and try again.',
          ),
        )
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

interface VerifyResponse {
  intentId: string
  status: 'paid'
  transactionId: string
}

export class RazorpayGateway implements PaymentGateway {
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

      if (intent.provider !== 'razorpay' || !intent.providerOrderId || !intent.keyId) {
        throw new PaymentError(
          'network',
          'The payment gateway is not available right now. Please try again in a moment.',
        )
      }

      await loadRazorpayScript()

      const user = useAuthStore.getState().user

      const checkout = await new Promise<RazorpaySuccessResponse>((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: intent.keyId ?? '',
          amount: Math.round(intent.amount * 100),
          currency: intent.currency || 'INR',
          order_id: intent.providerOrderId ?? '',
          name: 'PPD',
          description: 'Order payment',
          image: 'data:image/png;base64,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',
          handler: (response) => resolve(response),
          modal: { ondismiss: () => reject(new PaymentError('cancelled', 'Payment cancelled')) },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          notes: { intentId: intent.intentId },
          theme: { color: '#f97316' },
          retry: { enabled: false },
        })
        razorpay.on('payment.failed', (response) => {
          reject(
            new PaymentError(
              'declined',
              response.error?.description ?? 'Payment was declined by your bank. Please try again.',
            ),
          )
          // The reject above already won the promise; the dismiss this triggers is a no-op.
          try {
            razorpay.close()
          } catch {
            /* modal may already be closing */
          }
        })
        razorpay.open()
      })

      const { data } = await apiClient.post<VerifyResponse>('/payments/verify', {
        intentId: intent.intentId,
        razorpayOrderId: checkout.razorpay_order_id,
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpaySignature: checkout.razorpay_signature,
      })

      return { intentId: data.intentId, transactionId: data.transactionId }
    } catch (error) {
      throw toPaymentError(error)
    }
  }
}
