import { apiClient } from '@/services/api/client'
import { MockGateway } from '@/services/payments/mock.gateway'
import { RazorpayGateway } from '@/services/payments/razorpay.gateway'
import type { PaymentGateway } from '@/services/payments/types'

export * from '@/services/payments/types'

interface PaymentsConfig {
  provider: 'mock' | 'razorpay'
  keyId: string | null
}

let gatewayPromise: Promise<PaymentGateway> | null = null

/**
 * Resolve the active gateway once per session from GET /payments/config;
 * if the config endpoint is unreachable we fall back to the mock gateway.
 */
export async function getPaymentGateway(): Promise<PaymentGateway> {
  if (!gatewayPromise) {
    gatewayPromise = apiClient
      .get<PaymentsConfig>('/payments/config')
      .then(({ data }) => (data.provider === 'razorpay' ? new RazorpayGateway() : new MockGateway()))
      .catch(() => new MockGateway())
  }
  return gatewayPromise
}
