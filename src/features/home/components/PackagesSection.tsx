import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useBanners, usePackages } from '@/hooks/use-catalog'
import type { Package } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionHeader } from '@/components/shared/SectionHeader'

/** "Build Your Bundle & Save More!" orange banner — admin-managed (placement: 'bundle') with static fallback. */
export function BundleBanner() {
  const { data } = useBanners()
  const bundle = data?.find((b) => b.placement === 'bundle')

  return (
    <Link
      to={bundle?.href || ROUTES.category('stationery')}
      className="block aspect-[3/1] w-full overflow-hidden rounded-[18px] transition-transform hover:-translate-y-0.5"
    >
      <img
        src={bundle?.image || '/components/carousel2.png'}
        alt={bundle?.title || 'Build Your Bundle'}
        loading="lazy"
        className="h-full w-full max-w-full object-cover"
      />
    </Link>
  )
}

function PackageMiniCard({ pkg }: { pkg: Package }) {
  return (
    <Link
      to={ROUTES.package(pkg.slug)}
      className="group flex min-h-[145px] overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5"
    >
      {/* Left Column (50%) - Warm Off-white background */}
      <div className="flex w-1/2 flex-col justify-between bg-[#fdfaf6] p-3.5 pr-1.5 sm:p-4 dark:bg-[#25221e]">
        <div>
          <h3 className="font-urbanist text-[12.5px] font-extrabold leading-tight text-[#2a2723] dark:text-white sm:text-[14px]">
            {pkg.name}
          </h3>
          <p className="font-inter mt-1 line-clamp-2 text-[9.5px] font-medium leading-[1.3] text-[#736c63] sm:text-[11px] dark:text-muted-foreground">
            {pkg.description || `${pkg.itemCount} items in this kit`}
          </p>
        </div>

        <div className="mt-2">
          <span className="font-inter block text-[9px] font-medium leading-none text-[#8c857c] dark:text-muted-foreground">
            Starting From
          </span>
          <span className="font-inter mt-1 block text-[17px] font-extrabold leading-none text-[#2a2723] dark:text-white">
            {formatCurrency(pkg.price)}
          </span>
        </div>
      </div>

      {/* Right Column (50%) - White background */}
      <div className="flex w-1/2 flex-col justify-between bg-white p-3 dark:bg-card">
        {/* Product Image centered */}
        <div className="flex flex-1 items-center justify-center">
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              loading="lazy"
              className="max-h-[66px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Icon name="inventory_2" size={32} className="text-muted-foreground" />
          )}
        </div>

        {/* Explore button at the bottom of the right column */}
        <span className="mt-2 flex w-full items-center justify-center gap-[3px] rounded-full bg-[#f7941e] py-1.5 font-urbanist text-[10.5px] font-bold text-white shadow-[0_3px_10px_rgba(247,148,30,0.25)] transition-transform group-hover:translate-x-0.5 sm:text-[11px]">
          Explore
          <Icon name="arrow_forward" size={12} />
        </span>
      </div>
    </Link>
  )
}

/** "Shop by Packages" — smart kit cards, backed by real admin-curated bundles. */
export function PackagesSection() {
  const { data: packages, isPending } = usePackages()
  if (!isPending && !packages?.length) return null

  return (
    <section className="bg-[#FBE6CF] rounded-[24px] px-4 py-6 md:px-6 md:py-8 dark:bg-[#2a251f]">
      <SectionHeader
        title="Shop by Packages"
        subtitle="Everything you need, in one smart kit"
        viewAllHref={ROUTES.packages}
      />
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {isPending
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="min-h-[145px] rounded-[18px]" />)
          : packages?.map((pkg) => <PackageMiniCard key={pkg.id} pkg={pkg} />)}
      </div>
    </section>
  )
}
