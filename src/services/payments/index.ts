import { apiClient } from '@/services/api/client'
import { MockGateway } from '@/services/payments/mock.gateway'
import { RazorpayGateway } from '@/services/payments/razorpay.gateway'
import type { PaymentGateway } from '@/services/payments/types'

export * from '@/services/payments/types'

export interface PaymentsConfig {
  provider: 'mock' | 'razorpay'
  keyId: string | null
}

let configPromise: Promise<PaymentsConfig> | null = null

/**
 * Resolve the active payment config once per session from GET /payments/config;
 * if the config endpoint is unreachable we fall back to the mock provider so
 * checkout stays usable (the backend still decides the real provider per intent).
 */
export function getPaymentsConfig(): Promise<PaymentsConfig> {
  if (!configPromise) {
    configPromise = apiClient
      .get<PaymentsConfig>('/payments/config')
      .then(({ data }) => data)
      .catch(() => ({ provider: 'mock' as const, keyId: null }))
  }
  return configPromise
}

/** The gateway matching the active provider — Razorpay checkout or the built-in mock. */
export async function getPaymentGateway(): Promise<PaymentGateway> {
  const config = await getPaymentsConfig()
  return config.provider === 'razorpay' ? new RazorpayGateway() : new MockGateway()
}
