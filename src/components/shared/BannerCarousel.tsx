import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'

interface BannerCarouselProps {
  banners?: Banner[]
  loading?: boolean
  intervalMs?: number
  className?: string
}

/**
 * Hero banner from the design: orange gradient card, bold multi-line title,
 * white pill CTA, product imagery on the right, dots below the card.
 */
export function BannerCarousel({ banners, loading, intervalMs = 4500, className }: BannerCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = banners?.length ?? 0

  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(timer)
  }, [count, intervalMs])

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-[150px] w-full rounded-[20px] md:h-[220px]" />
      </div>
    )
  }
  if (!banners || count === 0) return null

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-[20px]">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.href}
              className={cn(
                'relative flex min-h-[150px] w-full shrink-0 overflow-hidden p-5 md:min-h-[220px] md:p-9',
                banner.tone,
              )}
            >
              <div className="z-10 flex-1">
                <h2 className="whitespace-pre-line text-[27px] font-extrabold leading-[1.08] text-white md:text-4xl">
                  {banner.title}
                </h2>
                <p className="mt-2 whitespace-pre-line text-[11px] leading-snug text-white/90 md:text-sm">
                  {banner.subtitle}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#3a3733] md:mt-4 md:text-sm">
                  {banner.cta}
                  <Icon name="arrow_forward" size={15} />
                </span>
              </div>
              <div className="absolute -right-1.5 bottom-3 top-3 w-[150px] overflow-hidden rounded-[14px] md:w-[340px]">
                <img src={banner.image} alt="" loading="lazy" className="size-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Dots count={count} active={index} onSelect={setIndex} className="mt-3" />
    </div>
  )
}
