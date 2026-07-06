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
      className="block w-full overflow-hidden rounded-[18px] transition-transform hover:-translate-y-0.5"
    >
      <img
        src="/components/carousel2.png"
        alt="Build Your Bundle"
        loading="lazy"
        className="w-full object-contain"
      />
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
            className="flex min-h-[135px] overflow-hidden rounded-[18px] bg-[#fdfaf6] shadow-[0_4px_12px_rgba(120,90,40,0.06)] transition-transform hover:-translate-y-0.5"
          >
            {/* Left Column */}
            <div className="flex flex-1 flex-col justify-between p-3 pr-2">
              <div>
                <h3 className="text-[12.5px] font-bold leading-snug text-[#2a2723]">{pkg.name}</h3>
                <p className="mt-1 text-[10px] leading-[1.35] text-[#8c857c]">{pkg.blurb}</p>
              </div>
              <div className="mt-2 flex flex-col justify-end">
                <div className="text-[10px] text-[#8c857c]">Starting From</div>
                <div className="mt-0.5 text-[17px] font-bold leading-none text-[#2a2723]">
                  {formatCurrency(pkg.price)}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex w-[90px] shrink-0 flex-col items-center justify-between bg-white p-2">
              <div className="pointer-events-none flex h-[72px] w-full items-center justify-center">
                <img src={pkg.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="flex w-full items-center justify-center gap-[2px] rounded-full bg-[#FBAA2E] py-[5.5px] text-[10.5px] font-bold text-white shadow-[0_3px_10px_rgba(251,170,46,0.35)] transition-transform">
                Explore
                <Icon name="arrow_forward" size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
