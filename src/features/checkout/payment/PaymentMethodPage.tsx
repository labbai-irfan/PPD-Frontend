import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { getPaymentsConfig } from '@/services/payments'
import { Spinner } from '@/components/ui/Spinner'
import CardPaymentPage from '@/features/checkout/payment/CardPaymentPage'
import UpiPaymentPage from '@/features/checkout/payment/UpiPaymentPage'
import NetbankingPaymentPage from '@/features/checkout/payment/NetbankingPaymentPage'
import GatewayPaymentPage from '@/features/checkout/payment/GatewayPaymentPage'

const FORM_PAGES = {
  card: CardPaymentPage,
  upi: UpiPaymentPage,
  netbanking: NetbankingPaymentPage,
} as const

type Method = keyof typeof FORM_PAGES

/**
 * /checkout/payment/:method — provider-aware dispatch:
 * - razorpay → GatewayPaymentPage (hosted checkout collects the details)
 * - mock     → the simulated instrument form for the chosen method
 */
export default function PaymentMethodPage() {
  const { method } = useParams()
  const [provider, setProvider] = useState<'mock' | 'razorpay' | null>(null)

  useEffect(() => {
    let active = true
    void getPaymentsConfig().then((config) => {
      if (active) setProvider(config.provider)
    })
    return () => {
      active = false
    }
  }, [])

  if (!method || !(method in FORM_PAGES)) return <Navigate to={ROUTES.checkout} replace />

  if (provider === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (provider === 'razorpay') return <GatewayPaymentPage />

  const FormPage = FORM_PAGES[method as Method]
  return <FormPage />
}
