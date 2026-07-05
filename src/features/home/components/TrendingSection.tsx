import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useProducts } from '@/hooks/use-catalog'
import type { Product } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionHeader } from '@/components/shared/SectionHeader'

function TrendingCard({ product }: { product: Product }) {
  return (
    <Link
      to={ROUTES.product(product.id)}
      className="w-[148px] shrink-0 rounded-2xl bg-white p-2.5 shadow-[0_6px_16px_rgba(120,80,20,0.12)] transition-transform hover:-translate-y-0.5 md:w-[190px]"
    >
      <div className="h-24 overflow-hidden rounded-[11px] bg-[#f5f3f1] md:h-32">
        <img src={product.images[0]} alt={product.title} loading="lazy" className="size-full object-cover" />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Icon name="group" size={15} fill className="text-accent" />
        <span className="text-[11px] font-medium text-[#6b645b]">{product.bought ?? `${product.ratingCount}+ bought`}</span>
      </div>
      <h3 className="mt-1 line-clamp-2 min-h-[33px] text-[12.5px] font-semibold leading-snug text-[#2a2723]">
        {product.title}
      </h3>
      {/* card is always white (design), so rating colors are fixed, not tokens */}
      <div className="mt-1 flex items-center gap-1">
        <Icon name="star" size={14} fill className="text-rating" />
        <span className="text-[11.5px] font-semibold text-[#2a2723]">{product.rating.toFixed(1)}</span>
        <span className="text-[11.5px] text-[#a7a099]">({product.ratingCount})</span>
      </div>
    </Link>
  )
}

/** "Trending Products" — the full-bleed orange gradient block. */
export function TrendingSection() {
  const { data, isPending } = useProducts({ tag: 'trending', pageSize: 8 })
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / 2))

  return (
    <section className="bg-grad-trending -mx-4 px-4 py-[18px] md:mx-0 md:rounded-[20px] md:px-6">
      <SectionHeader
        title="Trending Products"
        subtitle="Top Picks This Week"
        onColor
        viewAllHref={`${ROUTES.products}?tag=trending`}
        viewAllTone="pill"
        className="mb-3.5"
      />
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget
          const ratio = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)
          setPage(Math.round(ratio * (pageCount - 1)))
        }}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[196px] w-[148px] shrink-0 rounded-2xl bg-white/40" />)
          : items.map((product) => <TrendingCard key={product.id} product={product} />)}
      </div>
      <Dots count={pageCount} active={page} tone="light" className="mt-3.5" />
    </section>
  )
}
