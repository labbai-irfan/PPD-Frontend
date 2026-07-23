import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/utils'
import type { Banner } from '@/types'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'

interface BannerCarouselProps {
  banners?: Banner[]
  loading?: boolean
  /** Auto‑play interval in ms; set to false to disable automatic sliding */
  intervalMs?: number
  /** Enable automatic sliding; default false */
  autoPlay?: boolean
  className?: string
}

/**
 * Hero banner from the design: orange gradient card, bold multi-line title,
 * white pill CTA, product imagery on the right, dots below the card.
 */
export function BannerCarousel({ banners, loading, intervalMs = 4500, autoPlay = true, className }: BannerCarouselProps) {
  const [index, setIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  /* only hero-placement banners belong in the top carousel (bundle ones render in BundleBanner) */
  const heroBanners = banners?.filter((b) => !b.placement || b.placement === 'hero')
  const count = heroBanners?.length ?? 0

  useEffect(() => {
    if (!autoPlay || count <= 1 || isDragging) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(timer)
  }, [autoPlay, count, intervalMs, isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragOffset(e.clientX - dragStart)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        setIndex((i) => (i - 1 + count) % count)
      } else {
        setIndex((i) => (i + 1) % count)
      }
    }
    setDragOffset(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setDragOffset(e.touches[0].clientX - dragStart)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        setIndex((i) => (i - 1 + count) % count)
      } else {
        setIndex((i) => (i + 1) % count)
      }
    }
    setDragOffset(0)
  }

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="aspect-[396/189] w-full rounded-[25px]" />
      </div>
    )
  }
  if (!heroBanners || count === 0) return null

  return (
    <div className={className}>
      <div
        className="overflow-hidden rounded-[25px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(calc(-${index * 100}% + ${dragOffset}px))` }}
        >
          {heroBanners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.href}
              className={cn(
                'relative flex w-full shrink-0 overflow-hidden rounded-[25px]',
                banner.tone,
              )}
            >
              <img src={mediaUrl(banner.image)} alt={banner.title} loading="lazy" className="w-full h-auto object-cover" />
            </Link>
          ))}
        </div>
      </div>
      <Dots count={count} active={index} onSelect={setIndex} className="mt-3" />
    </div>
  )
}
