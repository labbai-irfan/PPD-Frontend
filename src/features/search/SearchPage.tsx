import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { clearRecentSearches, getRecentSearches, saveRecentSearch } from '@/lib/recent-searches'
import { popularSearches } from '@/mocks/home'
import { useProducts } from '@/hooks/use-catalog'
import type { Product } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { RatingBadge } from '@/components/ui/Rating'

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-white px-[15px] py-2 text-[12.5px] font-medium text-ink-soft shadow-[0_2px_7px_rgba(120,90,40,0.06)] transition-transform hover:scale-105 cursor-pointer dark:bg-muted dark:text-foreground"
    >
      {label}
    </button>
  )
}

function MiniResult({ product }: { product: Product }) {
  return (
    <Link
      to={ROUTES.product(product.id)}
      className="group flex w-[110px] shrink-0 flex-col rounded-[14px] bg-card p-2 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="aspect-square overflow-hidden rounded-[10px] bg-surface-placeholder dark:bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-[31px] px-0.5 text-xs font-medium leading-snug text-card-foreground dark:text-foreground">
        {product.title}
      </h3>
      <RatingBadge rating={product.rating} count={product.ratingCount} className="mt-1 px-0.5" />
    </Link>
  )
}

/**
 * The design's search overlay: dimmed backdrop, warm results card
 * (results / popular / recent) with the live search pill beneath it.
 */
export default function SearchPage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [recent, setRecent] = useState<string[]>(getRecentSearches)
  const query = value.trim()

  const { data, isPending } = useProducts(query ? { q: query, pageSize: 3 } : { pageSize: 0 })

  // Live typeahead: recommended product-name matches from the mock catalog.
  const { data: suggestData } = useProducts(query ? { q: query, pageSize: 6 } : { pageSize: 0 })
  const suggestions = query
    ? Array.from(new Set((suggestData?.items ?? []).map((p) => p.title))).slice(0, 5)
    : []

  // Empty-state recommendations: trending picks shown before the user types.
  const { data: recommended, isPending: recPending } = useProducts({ tag: 'trending', pageSize: 6 })

  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        setViewportHeight(window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }
    
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    const originalStyle = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && navigate(-1)
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = originalStyle
      document.removeEventListener('keydown', onKey)
    }
  }, [navigate])

  function commitSearch(term: string) {
    if (!term) return
    saveRecentSearch(term)
    navigate(`${ROUTES.allProducts}?q=${encodeURIComponent(term)}`)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    commitSearch(query)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end bg-[rgba(60,45,25,0.28)] backdrop-blur-[2px] md:justify-center"
      style={isMobile ? { height: `${viewportHeight}px`, bottom: 'auto' } : undefined}
    >
      <div 
        className="mx-auto flex w-full max-w-md flex-col p-3.5 pb-[calc(10px+env(safe-area-inset-bottom))] md:h-auto md:max-h-[85vh] md:max-w-xl h-full"
        style={isMobile ? { height: `${viewportHeight}px` } : undefined}
      >
        {/* Results card */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-[20px] bg-surface-search p-4 shadow-float animate-slide-up dark:bg-card">
          {query && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13.5px] text-ink-soft dark:text-foreground">
                  Showing results for <b className="font-semibold">“{query}”</b>
                </p>
                <button
                  type="button"
                  onClick={() => commitSearch(query)}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-[7px] text-[11.5px] font-semibold text-ink cursor-pointer dark:bg-muted dark:text-foreground"
                >
                  View All ({data?.total ?? 0})
                  <Icon name="arrow_forward" size={13} />
                </button>
              </div>
              <div className="my-3.5 border-t border-rule dark:border-border" />
            </>
          )}

          {suggestions.length > 0 && (
            <div className="mb-3.5 flex flex-col">
              {suggestions.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => commitSearch(term)}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-2 text-left transition-colors hover:bg-black/[0.04] cursor-pointer dark:hover:bg-white/5"
                >
                  <Icon name="search" size={17} className="shrink-0 text-muted-foreground" />
                  <span className="truncate text-[13.5px] text-ink-soft dark:text-foreground">{term}</span>
                  <Icon name="north_west" size={16} className="ml-auto shrink-0 text-faint-foreground" />
                </button>
              ))}
              <div className="mt-3 border-t border-rule dark:border-border" />
            </div>
          )}

          <p className="mb-2.5 text-[13.5px] font-semibold text-foreground">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Chip key={term} label={term} onClick={() => setValue(term)} />
            ))}
          </div>

          {query && (
            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {isPending ? (
                Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[150px] w-[110px] shrink-0 rounded-[11px]" />
                )
              ) : data && data.items.length > 0 ? (
                data.items.map((product) => <MiniResult key={product.id} product={product} />)
              ) : (
                <p className="w-full py-4 text-center text-sm text-muted-foreground">
                  No products found for “{query}”
                </p>
              )}
            </div>
          )}

          {recent.length > 0 && (
            <>
              <div className="mb-2.5 mt-4 flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-foreground">Recent Searches</p>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches()
                    setRecent([])
                  }}
                  className="text-[13px] font-semibold text-link cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <Chip key={term} label={term} onClick={() => setValue(term)} />
                ))}
              </div>
            </>
          )}

          {!query && (
            <>
              <p className="mb-2.5 mt-4 text-[13.5px] font-semibold text-foreground">Recommended For You</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {recPending
                  ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[150px] w-[110px] shrink-0 rounded-[11px]" />)
                  : (recommended?.items ?? []).map((product) => <MiniResult key={product.id} product={product} />)}
              </div>
            </>
          )}
        </div>

        {/* Live search bar */}
        <form
          onSubmit={onSubmit}
          className="mt-4 shrink-0 flex items-center gap-3 rounded-full bg-card px-[18px] py-[15px] shadow-float"
        >
          <Icon name="search" size={22} className="text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search by product name"
            enterKeyHint="search"
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-faint-foreground"
          />
          <button type="button" aria-label="Close search" onClick={() => navigate(-1)} className="cursor-pointer">
            <Icon name="close" size={22} className="text-muted-foreground" />
          </button>
          <Icon name="mic" size={22} className="text-muted-foreground" />
        </form>
      </div>
    </div>
  )
}
