import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_TAGLINE, BRAND_LINE, ROUTES } from '@/lib/constants'
import { useBanners, useHomeContent, useProducts } from '@/hooks/use-catalog'
import { useAuthStore } from '@/store/auth.store'
import { Dots } from '@/components/ui/Dots'
import { CircleIconButton } from '@/components/ui/CircleIconButton'
import { BannerCarousel } from '@/components/shared/BannerCarousel'
import { CartChip } from '@/components/shared/CartChip'
import { Logo } from '@/components/shared/Logo'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { QuickCategories } from '@/features/home/components/QuickCategories'
import { TrendingSection } from '@/features/home/components/TrendingSection'
import { HouseOfStoreSection } from '@/features/home/components/HouseOfStoreSection'
import { YogaSection } from '@/features/home/components/SeasonalSections'
import { BundleBanner, PackagesSection } from '@/features/home/components/PackagesSection'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning,'
  if (hour < 17) return 'Good Afternoon,'
  return 'Good Evening,'
}

/** Mobile greeting header from the design (desktop uses the app header instead). */
function HomeHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name.split(' ')[0] ?? 'Guest'

  return (
    <div className="flex items-start justify-between md:hidden">
      <div className="min-w-0 flex-1 pr-2">
        <CircleIconButton icon="/icons/hamburger.svg" iconSize={24} label="Menu" onClick={() => navigate(ROUTES.profile)} />
        <div className="mt-3">
          <p className="text-[15px] text-subtle-foreground">{greeting()}</p>
          <h1 className="break-words text-[26px] font-bold leading-[1.1] text-foreground">{firstName}</h1>
          <p className="mt-0.5 text-[13px] text-subtle-foreground">{APP_TAGLINE}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3.5">
        <CartChip />
        <div className="flex flex-col items-center gap-0.5">
          <Logo />
          <p className="max-w-[110px] text-center text-[8.5px] leading-[1.3] text-muted-foreground">{BRAND_LINE}</p>
        </div>
      </div>
    </div>
  )
}

/** Paginated "Recommended for You" grid with dot navigation. */
function RecommendedSection() {
  const [page, setPage] = useState(1)
  const { data, isPending } = useProducts({ page, pageSize: 6 })
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 6))

  return (
    <section>
      <SectionHeader title="Recommended for You" viewAllHref={ROUTES.allProducts} />
      <ProductGrid products={data?.items} loading={isPending} skeletonCount={6} />
      <Dots count={Math.min(totalPages, 5)} active={page - 1} onSelect={(i) => setPage(i + 1)} className="mt-3.5" />
    </section>
  )
}

export default function HomePage() {
  const banners = useBanners()
  const home = useHomeContent()

  return (
    <div className="space-y-4 md:space-y-8">
      <HomeHeader />
      <BannerCarousel banners={banners.data} loading={banners.isPending} className="mt-2 md:mt-0" />
      <QuickCategories />
      <TrendingSection />
      <HouseOfStoreSection cards={home.data?.houseCards} />
      <RecommendedSection />
      <YogaSection tiles={home.data?.yogaTiles} promos={home.data?.yogaPromos} />
      <BundleBanner />
      <PackagesSection packages={home.data?.packages} />
    </div>
  )
}
