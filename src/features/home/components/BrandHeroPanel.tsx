import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'

/**
 * Desktop-only companion to the banner carousel. Turns the bare stretched
 * banner into a proper hero: warm gradient panel with brand promise + CTAs.
 * Stretches to the banner's height inside the hero grid row.
 */
export function BrandHeroPanel() {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[25px] bg-grad-hero p-6 text-white shadow-float">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
          <Icon name="workspace_premium" size={14} fill />
          Since 1926
        </span>
        <h2 className="mt-4 font-urbanist text-[26px] font-extrabold leading-[1.15]">
          Everything for school, in one trusted place
        </h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-white/90">
          Books, stationery, bags & more — curated for students, loved by parents.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          to={ROUTES.allProducts}
          className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-urbanist text-[14px] font-bold text-primary-soft-foreground shadow-sm transition-transform hover:scale-[1.02]"
        >
          Shop all products
          <Icon name="arrow_forward" size={16} />
        </Link>
        <Link
          to={ROUTES.bulkOrder}
          className="flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/15 px-5 py-3 font-urbanist text-[14px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          Bulk & school orders
        </Link>
      </div>
    </div>
  )
}
