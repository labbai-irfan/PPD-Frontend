import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { mediaUrl } from '@/lib/utils'
import { useProducts } from '@/hooks/use-catalog'
import type { Product } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'

function TrendingCard({ product }: { product: Product }) {
  return (
    <Link
      to={ROUTES.product(product.id)}
      className="w-[148px] shrink-0 snap-start rounded-2xl bg-white p-2.5 shadow-[0_6px_16px_rgba(120,80,20,0.12)] transition-transform hover:-translate-y-0.5 md:w-[190px]"
    >
      <div className="h-24 overflow-hidden rounded-[11px] bg-[#f5f3f1] md:h-32">
        <img src={mediaUrl(product.images[0])} alt={product.title} loading="lazy" className="size-full object-cover" />
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
  const [pageCount, setPageCount] = useState(1)

  const items = data?.items ?? []

  if (!isPending && items.length === 0) return null

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const scrollable = el.scrollWidth - el.clientWidth
    if (scrollable <= 0) return
    const pages = Math.round(el.scrollWidth / el.clientWidth)
    setPageCount(Math.max(1, pages))
    const ratio = el.scrollLeft / scrollable
    setPage(Math.round(ratio * (pages - 1)))
  }

  function handleLoad(e: React.UIEvent<HTMLDivElement> | { currentTarget: HTMLDivElement }) {
    const el = e.currentTarget
    const scrollable = el.scrollWidth - el.clientWidth
    setPageCount(scrollable > 4 ? Math.max(1, Math.round(el.scrollWidth / el.clientWidth)) : 1)
  }

  return (
    <section
      className="bg-grad-trending overflow-hidden rounded-[20px] bg-cover bg-center px-4 py-[18px] md:px-6"
      style={{ backgroundImage: "url('/components/bg3.png')" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3 rounded-[20px] border border-white/20 bg-white/20 px-4 py-3.5 backdrop-blur-md md:px-5">
        <div className="flex min-w-0 flex-col">
          <h2 className="text-[17px] font-bold text-[#24211e] leading-tight">Trending Products</h2>
          <p className="text-[12px] font-medium text-[#24211e] mt-0.5">Top Picks This Week</p>
        </div>
        <Link
          to={`${ROUTES.allProducts}?tag=trending`}
          className="flex min-h-[44px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#fdf1e1] px-[18px] py-2.5 text-[11.5px] font-bold text-[#24211e] shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform hover:scale-105"
        >
          View All
          <Icon name="arrow_forward" size={14} />
        </Link>
      </div>
      <div
        onScroll={handleScroll}
        ref={(el) => {
          (trackRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (el) handleLoad({ currentTarget: el })
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4"
      >
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[196px] w-[148px] shrink-0 snap-start rounded-2xl bg-white/40" />)
          : items.map((product) => <TrendingCard key={product.id} product={product} />)}
      </div>
      <Dots count={pageCount} active={page} tone="light" className="mt-3.5" />
    </section>
  )
}
