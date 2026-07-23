import { useState } from 'react'
import { ChevronDown, Headset, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { CONTACT_INFO } from '@/lib/constants'

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

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Headset className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">How can we help?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answers to common questions, or reach us directly.</p>
      </div>

      <div className="mb-8 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">{CONTACT_INFO.orders.title}</h3>
        <Card className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex items-start gap-2 flex-1">
            <Mail className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Email</p>
              <a href={`mailto:${CONTACT_INFO.orders.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.orders.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2 flex-1">
            <Phone className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Phone</p>
              <a href={`tel:${CONTACT_INFO.orders.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.orders.phone}
              </a>
            </div>
          </div>
        </Card>

        <h3 className="font-semibold text-foreground text-sm mt-4">{CONTACT_INFO.corporate.title}</h3>
        <Card className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex items-start gap-2 flex-1">
            <Mail className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Email</p>
              <a href={`mailto:${CONTACT_INFO.corporate.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.corporate.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2 flex-1">
            <Phone className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Phone</p>
              <a href={`tel:${CONTACT_INFO.corporate.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.corporate.phone}
              </a>
            </div>
          </div>
        </Card>

        <h3 className="font-semibold text-foreground text-sm mt-4">{CONTACT_INFO.general.title}</h3>
        <Card className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex items-start gap-2 flex-1">
            <Mail className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Email</p>
              <a href={`mailto:${CONTACT_INFO.general.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.general.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2 flex-1">
            <Phone className="size-4 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Phone</p>
              <a href={`tel:${CONTACT_INFO.general.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.general.phone}
              </a>
            </div>
          </div>
        </Card>
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
