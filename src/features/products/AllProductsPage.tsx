import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCategories, useProducts } from '@/hooks/use-catalog'
import type { ProductQuery, ProductTag, SortOption } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { CircleIconButton } from '@/components/ui/CircleIconButton'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { TopBar } from '@/components/shared/TopBar'

const PAGE_SIZE = 15

export const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Discount' },
  { value: 'newest', label: 'Newest' },
]

export function SortInline({
  value,
  onChange,
  className,
}: {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}) {
  const current = sortOptions.find((o) => o.value === value) ?? sortOptions[0]
  return (
    <div className={cn('relative flex items-center gap-4', className)}>
      <span className="flex items-center gap-0.5 text-[13px] font-semibold text-ink dark:text-foreground">
        Sort By
        <Icon name="expand_more" size={17} />
      </span>
      <span className="flex items-center gap-0.5 text-[13px] font-semibold text-ink dark:text-foreground">
        {current.label}
        <Icon name="expand_more" size={17} />
      </span>
      <select
        aria-label="Sort products"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const tagLabels: Record<ProductTag, string> = {
  deal: 'Deals',
  new: 'New',
  featured: 'Featured',
  bestseller: 'Bestsellers',
  trending: 'Trending',
}

/** The design's "All Products" screen: applied filter chips + grid + pagination. */
export default function AllProductsPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data: categories } = useCategories()

  const category = params.get('category') ?? undefined
  const tag = (params.get('tag') as ProductTag | null) ?? undefined
  const q = params.get('q') ?? undefined
  const sort = (params.get('sort') as SortOption | null) ?? 'relevance'
  const page = Number(params.get('page') ?? '1')

  const query: ProductQuery = { category, tag, q, sort, page, pageSize: PAGE_SIZE }
  const { data, isPending } = useProducts(query)
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  function update(mutate: (p: URLSearchParams) => void, resetPage = true) {
    const next = new URLSearchParams(params)
    mutate(next)
    if (resetPage) next.delete('page')
    setParams(next)
  }

  const chips: Array<{ key: string; label: string; remove: () => void }> = []
  if (category) {
    chips.push({
      key: 'category',
      label: categories?.find((c) => c.slug === category)?.name ?? category,
      remove: () => update((p) => p.delete('category')),
    })
  }
  if (tag) chips.push({ key: 'tag', label: tagLabels[tag], remove: () => update((p) => p.delete('tag')) })
  if (q) chips.push({ key: 'q', label: `“${q}”`, remove: () => update((p) => p.delete('q')) })

  /* Category + sort chip groups, shared by the mobile filter sheet and the lg+ sidebar. */
  const filterGroups = (
    <>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
      <div className="flex flex-wrap gap-2">
        {categories?.map((c) => {
          const active = (category ?? 'all') === c.slug
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => update((p) => (c.slug === 'all' ? p.delete('category') : p.set('category', c.slug)))}
              className={cn(
                'min-h-[44px] rounded-full px-4 py-2.5 text-[12.5px] font-medium shadow-soft cursor-pointer',
                active ? 'bg-primary font-semibold text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {c.name}
            </button>
          )
        })}
      </div>
      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</p>
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => {
          const active = sort === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => update((p) => (opt.value === 'relevance' ? p.delete('sort') : p.set('sort', opt.value)))}
              className={cn(
                'min-h-[44px] rounded-full px-4 py-2.5 text-[12.5px] font-medium shadow-soft cursor-pointer',
                active ? 'bg-primary font-semibold text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </>
  )

  return (
    <div>
      <TopBar />

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden pt-2.5 lg:block">
          <div className="sticky top-4">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Filters</h2>
            {filterGroups}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 pt-2.5">
            <h1 className="text-[19px] font-bold text-foreground sm:text-2xl">All Products</h1>
            {chips.length > 0 && (
              <span className="shrink-0 text-[13px] font-semibold text-link">
                {chips.length} {chips.length === 1 ? 'Filter' : 'Filters'} Applied
              </span>
            )}
          </div>

          {/* Applied chips + filter FAB (FAB opens the mobile sheet; hidden at lg where the sidebar shows) */}
          <div className="flex items-center justify-between gap-2 pb-1.5 pt-2.5">
            <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-2.5 text-[12.5px] font-medium text-ink-soft shadow-soft cursor-pointer dark:text-foreground"
                >
                  <Icon name="cancel" size={18} fill className="text-accent" />
                  {chip.label}
                </button>
              ))}
            </div>
            <CircleIconButton icon="filter_alt" iconSize={20} size={44} tone="solid" label="Filters" onClick={() => setFiltersOpen(true)} className="lg:hidden" />
          </div>

          {/* Sort stays reachable even with filters applied; lg+ uses the sidebar's sort chips */}
          <SortInline
            value={sort}
            onChange={(v) => update((p) => (v === 'relevance' ? p.delete('sort') : p.set('sort', v)))}
            className="pb-1.5 pt-1 lg:hidden"
          />

          {!isPending && (data?.total ?? 0) === 0 ? (
            <EmptyState
              icon={<Icon name="search_off" size={36} />}
              title="No products match your filters"
              description="Remove a filter or explore other categories."
              action={<Button onClick={() => setParams(new URLSearchParams())}>Clear all</Button>}
            />
          ) : (
            <>
              <ProductGrid products={data?.items} loading={isPending} skeletonCount={9} className="mt-1.5" />
              <Pagination page={page} totalPages={totalPages} onChange={(p) => update((params2) => params2.set('page', String(p)), false)} />
            </>
          )}
        </div>
      </div>

      {/* Filter sheet (mobile/tablet only — opened by the FAB, which is hidden at lg+) */}
      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {filterGroups}
        <Button className="mt-6 w-full" size="lg" onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </Modal>
    </div>
  )
}
