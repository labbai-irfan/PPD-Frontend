import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { PackageCard } from '@/mocks/home'
import { Icon } from '@/components/ui/Icon'
import { SectionHeader } from '@/components/shared/SectionHeader'

/** "Build Your Bundle & Save More!" orange banner. */
export function BundleBanner() {
  return (
    <Link
      to={ROUTES.category('stationery')}
      className="bg-grad-primary relative flex items-center overflow-hidden rounded-[18px] p-[18px] md:p-7"
    >
      <div className="z-10 flex-1">
        <h2 className="text-[17px] font-extrabold leading-[1.15] text-white md:text-2xl">
          Build Your Bundle
          <br />
          &amp; Save More!
        </h2>
        <p className="mt-1.5 max-w-[180px] text-[10.5px] text-white/90 md:max-w-xs md:text-xs">
          Pick your favourite stationery items and get up to 30% OFF
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[11.5px] font-semibold text-[#3a3733]">
          Build Bundle
          <Icon name="arrow_forward" size={14} />
        </span>
      </div>
      <div className="h-[90px] w-24 shrink-0 overflow-hidden rounded-xl md:h-[120px] md:w-40">
        <img
          src="https://picsum.photos/seed/ppd-bundle/300/280"
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    </Link>
  )
}

/** "Shop by Packages" — smart kit cards. */
export function PackagesSection({ packages }: { packages?: PackageCard[] }) {
  if (!packages?.length) return null
  return (
    <section>
      <SectionHeader
        title="Shop by Packages"
        subtitle="Everything you need, in one smart kit"
        viewAllHref={ROUTES.category('stationery')}
      />
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {packages.map((pkg) => (
          <Link
            key={pkg.name}
            to={pkg.href}
            className="rounded-[14px] bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-[13px] font-bold text-card-foreground">{pkg.name}</h3>
                <p className="mt-0.5 max-w-[82px] text-[9.5px] leading-snug text-faint-foreground md:max-w-none">
                  {pkg.blurb}
                </p>
              </div>
              <img src={pkg.image} alt="" loading="lazy" className="size-11 shrink-0 rounded-lg object-cover" />
            </div>
            <div className="mt-2.5 text-[9.5px] text-muted-foreground">Starting From</div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{formatCurrency(pkg.price)}</span>
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-[5px] text-[10px] font-semibold text-primary-foreground">
                Explore
                <Icon name="arrow_forward" size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
