import { useState } from 'react'
import { ChevronDown, Headset, Mail, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders from your profile, open the order and you\'ll see a live status timeline — from "Order placed" through "Delivered".',
  },
  {
    q: 'What is the return policy?',
    a: 'Most products can be returned within 7–15 days of delivery (the exact window is shown on each product page). Items must be unused with original packaging and tags.',
  },
  {
    q: 'When will I get my refund?',
    a: 'Refunds are processed as soon as the returned item passes a quality check — typically within 3–5 business days to your original payment method.',
  },
  {
    q: 'How do I apply a coupon?',
    a: 'On the cart page, enter your coupon code in the coupon box and tap Apply. You can browse all active offers on the Coupons page.',
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes — COD is available on most orders. Select "Cash on Delivery" as your payment method at checkout.',
  },
]

const channels = [
  { icon: MessageCircle, label: 'Live chat', detail: '9 AM – 9 PM, all days' },
  { icon: Mail, label: 'Email us', detail: 'support@shopora.example' },
  { icon: Phone, label: 'Call us', detail: '1800-000-000 (toll free)' },
]

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
          <Headset className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">How can we help?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answers to common questions, or reach us directly.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.label} className="flex flex-col items-center gap-1.5 p-4 text-center">
            <channel.icon className="size-5 text-primary" />
            <p className="text-sm font-bold text-foreground">{channel.label}</p>
            <p className="text-xs text-muted-foreground break-words">{channel.detail}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Frequently asked questions
      </h2>
      <Card className="divide-y divide-border">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 p-4 text-left cursor-pointer"
            >
              <span className="text-sm font-semibold text-foreground">{faq.q}</span>
              <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open === i && 'rotate-180')} />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>}
          </div>
        ))}
      </Card>
    </div>
  )
}
