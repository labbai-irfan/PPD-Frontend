import { TopBar } from '@/components/shared/TopBar'
import { QuickCategories } from '@/features/home/components/QuickCategories'
import { BannerCarousel } from '@/components/shared/BannerCarousel'
import { BundleBanner } from '@/features/home/components/PackagesSection'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ProductGridHorizontal } from '@/components/shared/ProductGridHorizontal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBanners, useCategories, useProducts } from '@/hooks/use-catalog'
import { ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'
import { Link } from 'react-router-dom'
import type { Category } from '@/types'

/** The design's two alternating card color schemes (red / blue). */
const cardStyles = [
  { accent: 'text-[#E12234] dark:text-[#FF7A88]', bg: 'bg-[#FFF0F2] dark:bg-[#3a2226]' },
  { accent: 'text-[#1853A5] dark:text-[#7FB2FF]', bg: 'bg-[#EAF3FF] dark:bg-[#1e2a3d]' },
]

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const style = cardStyles[index % cardStyles.length]

  return (
    <Link
      to={ROUTES.category(category.slug)}
      className="group grid grid-cols-[57%_43%] min-h-[135px] overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5"
    >
      {/* Left Column (57%) */}
      <div className={`relative z-10 flex flex-col justify-between p-3.5 pr-1.5 sm:p-4 ${style.bg}`}>
        <div>
          <h3 className={`line-clamp-2 break-words text-[12.5px] font-extrabold leading-[1.2] sm:text-[14.5px] ${style.accent}`}>
            {category.name}
          </h3>
          <p className="mt-1 line-clamp-3 text-[9.5px] font-medium leading-[1.3] text-[#6b645b] sm:text-[11px] dark:text-muted-foreground">
            {category.description || `${category.productCount} products to explore.`}
          </p>
        </div>
        <span className="mt-3.5 inline-flex w-fit items-center gap-[3px] rounded-full bg-[#FBAA2E] px-2.5 py-1 text-[9.5px] font-bold text-white shadow-[0_3px_10px_rgba(251,170,46,0.35)] transition-transform group-hover:translate-x-0.5 sm:px-3.5 sm:py-[6px] sm:text-[11px]">
          Explore
          <Icon name="arrow_forward" size={12} />
        </span>
      </div>

      {/* Right Column (43%) */}
      <div className="flex items-center justify-center bg-white p-3 dark:bg-card">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="max-h-[100px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : category.icon.length <= 3 ? (
          <span className="text-5xl transition-transform duration-300 group-hover:scale-105">
            {category.icon}
          </span>
        ) : (
          <Icon name={category.icon} size={56} fill style={{ color: category.color || '#FBAA2E' }} />
        )}
      </div>
    </Link>
  )
}

function CategoryCardsGrid() {
  const { data, isPending } = useCategories()
  const categories = data?.filter((c) => c.slug !== 'all') ?? []

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 xl:grid-cols-4">
      {isPending
        ? Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="min-h-[135px] rounded-[18px]" />
          ))
        : categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
    </div>
  )
}

function RecommendedSection() {
  const { data, isPending } = useProducts({ page: 1, pageSize: 6 })

  return (
    <section>
      <SectionHeader title="Recommended for You" viewAllHref={ROUTES.allProducts} className="mb-3.5" />
      <ProductGridHorizontal products={data?.items} loading={isPending} skeletonCount={6} />
    </section>
  )
}

/** The design's Category screen */
export default function ProductListingPage() {
  const banners = useBanners()

  return (
    <div className="space-y-4 md:space-y-6">
      <TopBar leading="menu" />

      <div className="px-1">
        <h1 className="text-[20px] font-extrabold text-foreground sm:text-2xl">Categories to Explore</h1>
        <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground sm:text-sm">
          Everything you need, in one smart kit
        </p>
      </div>

      <CategoryCardsGrid />

      <div className="pt-2">
        <QuickCategories />
      </div>

      <div className="pt-2">
        <BannerCarousel banners={banners.data} loading={banners.isPending} />
      </div>

      <RecommendedSection />

      <div className="py-2">
        <BundleBanner />
      </div>
    </div>
  )
}
