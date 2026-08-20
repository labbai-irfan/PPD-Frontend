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
import SEO from '@/components/shared/SEO'
import { SITE_URL } from '@/lib/constants'

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

  /* Categories are multi-select: the param holds a comma-separated list of slugs. */
  const selectedCategories = params.get('category')?.split(',').filter(Boolean) ?? []
  const category = selectedCategories.join(',') || undefined
  const tag = (params.get('tag') as ProductTag | null) ?? undefined
  const q = params.get('q') ?? undefined
  const ppdOriginal = params.get('ppdOriginal') === 'true'
  const sort = (params.get('sort') as SortOption | null) ?? 'relevance'
  const page = Number(params.get('page') ?? '1')

  const query: ProductQuery = { category, tag, q, sort, page, pageSize: PAGE_SIZE, ppdOriginal: ppdOriginal || undefined }
  const { data, isPending, isError, refetch } = useProducts(query)
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  function update(mutate: (p: URLSearchParams) => void, resetPage = true) {
    const next = new URLSearchParams(params)
    mutate(next)
    if (resetPage) next.delete('page')
    setParams(next)
  }

  /** Add or remove one category slug, keeping the rest of the selection. */
  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug]
    update((p) => (next.length ? p.set('category', next.join(',')) : p.delete('category')))
  }

  const chips: Array<{ key: string; label: string; remove: () => void }> = []
  for (const slug of selectedCategories) {
    chips.push({
      key: `category:${slug}`,
      label: categories?.find((c) => c.slug === slug)?.name ?? slug,
      remove: () => toggleCategory(slug),
    })
  }
  if (tag) chips.push({ key: 'tag', label: tagLabels[tag], remove: () => update((p) => p.delete('tag')) })
  if (q) chips.push({ key: 'q', label: `“${q}”`, remove: () => update((p) => p.delete('q')) })
  if (ppdOriginal) {
    chips.push({ key: 'ppdOriginal', label: 'PPD Original', remove: () => update((p) => p.delete('ppdOriginal')) })
  }

  /* Only top-level categories get their own chip; subcategories surface once their parent is active. */
  const topLevelCategories = categories?.filter((c) => !c.parentId) ?? []
  const activeParentIds = new Set(
    (categories ?? []).filter((c) => selectedCategories.includes(c.slug)).map((c) => c.parentId ?? c.id),
  )
  const subcategories = categories?.filter((c) => c.parentId && activeParentIds.has(c.parentId)) ?? []

  /* Category + sort chip groups, shared by the mobile filter sheet and the lg+ sidebar. */
  const filterGroups = (
    <>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
      <div className="flex flex-wrap gap-2">
        {topLevelCategories.map((c) => {
          const active = c.slug === 'all' ? selectedCategories.length === 0 : selectedCategories.includes(c.slug)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => (c.slug === 'all' ? update((p) => p.delete('category')) : toggleCategory(c.slug))}
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
      {subcategories.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subcategory</p>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => {
              const active = selectedCategories.includes(sub.slug)
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleCategory(sub.slug)}
                  className={cn(
                    'min-h-[44px] rounded-full px-4 py-2.5 text-[12.5px] font-medium shadow-soft cursor-pointer',
                    active ? 'bg-primary font-semibold text-primary-foreground' : 'bg-muted text-foreground',
                  )}
                >
                  {sub.name}
                </button>
              )
            })}
          </div>
        </>
      )}
      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update((p) => (ppdOriginal ? p.delete('ppdOriginal') : p.set('ppdOriginal', 'true')))}
          className={cn(
            'min-h-[44px] rounded-full px-4 py-2.5 text-[12.5px] font-medium shadow-soft cursor-pointer',
            ppdOriginal ? 'bg-primary font-semibold text-primary-foreground' : 'bg-muted text-foreground',
          )}
        >
          PPD Original
        </button>
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

  const activeCategory = selectedCategories.length === 1
    ? categories?.find((c) => c.slug === selectedCategories[0])
    : null

  const seoTitle = activeCategory ? activeCategory.name : 'All Products'
  const seoDescription = activeCategory?.description
    ? activeCategory.description
    : `Shop ${seoTitle.toLowerCase()} online — books, stationery and school essentials.`

  const canonicalUrl = activeCategory
    ? `${SITE_URL}/products/all?category=${activeCategory.slug}`
    : `${SITE_URL}/products/all`

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <SEO title={seoTitle} description={seoDescription} canonicalUrl={canonicalUrl} />
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
          <div className="flex flex-col gap-1.5 pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-[19px] font-bold text-foreground sm:text-2xl">{seoTitle}</h1>
              {chips.length > 0 && (
                <span className="shrink-0 text-[13px] font-semibold text-link">
                  {chips.length} {chips.length === 1 ? 'Filter' : 'Filters'} Applied
                </span>
              )}
            </div>
            {activeCategory?.description && (
              <p className="text-[13px] text-subtle-foreground max-w-2xl leading-relaxed">{activeCategory.description}</p>
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

          {isError ? (
            /* A failed request is not an empty result — saying "no products" hides the outage */
            <EmptyState
              icon={<Icon name="cloud_off" size={36} />}
              title="Couldn’t load products"
              description="The server didn’t respond. Check your connection and try again."
              action={<Button onClick={() => void refetch()}>Try again</Button>}
            />
          ) : !isPending && (data?.total ?? 0) === 0 ? (
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
