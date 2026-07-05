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
    <Link to={ROUTES.product(product.id)} className="block">
      <div className="h-[100px] overflow-hidden rounded-[11px] bg-white dark:bg-muted">
        <img src={product.images[0]} alt={product.title} loading="lazy" className="size-full object-cover" />
      </div>
      <p className="mt-1.5 line-clamp-2 min-h-[31px] text-xs font-medium leading-snug text-card-foreground dark:text-foreground">
        {product.title}
      </p>
      <RatingBadge rating={product.rating} count={product.ratingCount} className="mt-1" />
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && navigate(-1)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(60,45,25,0.28)] backdrop-blur-[2px]">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col p-3.5 md:max-w-xl md:justify-center">
        {/* Results card */}
        <div className="rounded-[20px] bg-surface-search p-4 shadow-float animate-slide-up dark:bg-card">
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

          <p className="mb-2.5 text-[13.5px] font-semibold text-foreground">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Chip key={term} label={term} onClick={() => setValue(term)} />
            ))}
          </div>

          {query && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {isPending ? (
                Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[150px] rounded-[11px]" />
                )
              ) : data && data.items.length > 0 ? (
                data.items.map((product) => <MiniResult key={product.id} product={product} />)
              ) : (
                <p className="col-span-3 py-4 text-center text-sm text-muted-foreground">
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
        </div>

        {/* Live search bar */}
        <form
          onSubmit={onSubmit}
          className="mt-4 flex items-center gap-3 rounded-full bg-card px-[18px] py-[15px] shadow-float"
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
