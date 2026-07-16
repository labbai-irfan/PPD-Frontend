import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'

const items: Array<{ icon: string; title: string; sub: string }> = [
  { icon: 'local_shipping', title: 'Free Delivery', sub: `On orders over ₹${FREE_SHIPPING_THRESHOLD}` },
  { icon: 'verified_user', title: 'Secure Payments', sub: '100% protected checkout' },
  { icon: 'history_edu', title: 'Trusted since 1926', sub: "India's education partner" },
  { icon: 'autorenew', title: 'Easy Returns', sub: '7-day hassle-free' },
]

/**
 * Credibility strip shown under the hero. 2×2 on mobile, single row on desktop —
 * gives the desktop homepage the trust cues shoppers expect above the fold.
 */
export function TrustBar() {
  return (
    <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="flex items-center gap-3 rounded-2xl bg-card px-3.5 py-3 shadow-card transition-transform hover:-translate-y-0.5 md:px-4 md:py-4"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary md:size-12">
            <Icon name={item.icon} size={22} fill />
          </span>
          <div className="min-w-0">
            <p className="truncate font-urbanist text-[13px] font-bold text-foreground md:text-[15px]">{item.title}</p>
            <p className="truncate text-[11px] text-muted-foreground md:text-[12.5px]">{item.sub}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
