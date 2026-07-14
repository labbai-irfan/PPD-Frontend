import { apiClient } from '@/services/api/client'
import { useAuthStore } from '@/store/auth.store'
import type { CartItem } from '@/types'
import {
  PaymentError,
  toPaymentError,
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

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
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
          handler: (response) => resolve(response),
          modal: { ondismiss: () => reject(new PaymentError('cancelled', 'Payment cancelled')) },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: '#f97316' },
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
