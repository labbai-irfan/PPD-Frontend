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
        <Skeleton className="aspect-[396/189] w-full rounded-[25px]" />
      </div>
    )
  }
  if (!banners || count === 0) return null

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-[25px]">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.href}
              className={cn(
                'relative flex w-full aspect-[396/189] shrink-0 overflow-hidden rounded-[25px]',
                banner.tone,
              )}
            >
              <img src={banner.image} alt={banner.title} loading="lazy" className="w-full h-full object-cover" />
            </Link>
          ))}
        </div>
      </div>
      <Dots count={count} active={index} onSelect={setIndex} className="mt-3" />
    </div>
  )
}
