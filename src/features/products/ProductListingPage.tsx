import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCategories, useProducts } from '@/hooks/use-catalog'
import type { ProductQuery, ProductTag, SortOption } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { CircleIconButton } from '@/components/ui/CircleIconButton'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
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

/** "Sort By ⌄  Popular ⌄" row from the design — a real select drives it. */
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

/** The design's Category screen: banner, category chips, sort row, 3-col grid. */
export default function ProductListingPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data: categories } = useCategories()

  const activeCategory = params.get('category') ?? 'all'
  const sort = (params.get('sort') as SortOption | null) ?? 'relevance'
  const tag = (params.get('tag') as ProductTag | null) ?? undefined
  const page = Number(params.get('page') ?? '1')

  const query: ProductQuery = {
    category: activeCategory,
    tag,
    sort,
    page,
    pageSize: PAGE_SIZE,
  }
  const { data, isPending } = useProducts(query)
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  function update(mutate: (p: URLSearchParams) => void, resetPage = true) {
    const next = new URLSearchParams(params)
    mutate(next)
    if (resetPage) next.delete('page')
    setParams(next)
  }

  return (
    <div>
      <TopBar />

      {/* Category banner */}
      <div className="bg-grad-hero relative mt-3 flex min-h-[110px] items-center overflow-hidden rounded-2xl p-5 md:mt-0 md:min-h-[160px] md:p-8">
        <h1 className="z-10 text-2xl font-extrabold leading-[1.1] text-white md:text-3xl">
          Smart
          <br />
          School
          <br />
          Shopping
        </h1>
        <img
          src="https://picsum.photos/seed/ppd-category-banner/500/300"
          alt=""
          loading="lazy"
          className="absolute bottom-0 right-0 top-0 w-[200px] object-cover md:w-[420px]"
        />
      </div>

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1.5 pt-3.5 md:mx-0 md:px-0">
        {categories?.map((category) => {
          const active = activeCategory === category.slug
          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                update((p) => {
                  if (category.slug === 'all') p.delete('category')
                  else p.set('category', category.slug)
                })
              }
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-[12.5px] font-medium shadow-soft transition-colors cursor-pointer',
                active ? 'bg-primary font-semibold text-primary-foreground' : 'bg-card text-ink-soft dark:text-foreground',
              )}
            >
              {category.name}
            </button>
          )
        })}
      </div>

      {/* Sort row + filter FAB */}
      <div className="flex items-center justify-between py-1.5">
        <SortInline value={sort} onChange={(v) => update((p) => (v === 'relevance' ? p.delete('sort') : p.set('sort', v)))} />
        <CircleIconButton
          icon="filter_alt"
          iconSize={20}
          size={40}
          tone="solid"
          label="All products with filters"
          onClick={() => navigate(ROUTES.allProducts + (activeCategory !== 'all' ? `?category=${activeCategory}` : ''))}
        />
      </div>

      {!isPending && (data?.total ?? 0) === 0 ? (
        <EmptyState
          icon={<Icon name="search_off" size={36} />}
          title="No products found"
          description="Try a different category or clear the filters."
          action={<Button onClick={() => setParams(new URLSearchParams())}>Clear filters</Button>}
        />
      ) : (
        <>
          <ProductGrid products={data?.items} loading={isPending} skeletonCount={9} className="mt-1.5" />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => update((params2) => params2.set('page', String(p)), false)} />
        </>
      )}
    </div>
  )
}
