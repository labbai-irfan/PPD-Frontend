import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'

/**
 * Full-width promotional band for institutional / bulk buyers — highly relevant
 * for an educational publisher. Fills the wider desktop canvas with a clear,
 * on-brand CTA to an existing route.
 */
export function BulkCtaBand() {
  return (
    <section className="overflow-hidden rounded-[25px] bg-grad-hero shadow-float">
      <div className="flex flex-col items-start gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-9">
        <div className="flex items-center gap-4">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md md:flex">
            <Icon name="school" size={30} fill />
          </span>
          <div>
            <h2 className="font-urbanist text-[20px] font-extrabold leading-tight text-white md:text-[26px]">
              Ordering for a school or in bulk?
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/90 md:text-[14px]">
              Get institutional pricing, custom quotes and dedicated support for large orders.
            </p>
          </div>
        </div>
        <Link
          to={ROUTES.bulkOrder}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-urbanist text-[14px] font-bold text-primary-soft-foreground shadow-sm transition-transform hover:scale-[1.03] md:text-[15px]"
        >
          Request a quote
          <Icon name="arrow_forward" size={17} />
        </Link>
      </div>
    </section>
  )
}
