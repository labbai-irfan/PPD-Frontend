import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { mediaUrl } from '@/lib/utils'
import { useCategories } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'

const CATEGORY_ASSETS: Record<string, string> = {
  all: '/icons/menu.svg',
}

const formatCategoryName = (name: string) => {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Quick category tiles: white rounded squares with colored filled icons or custom assets. */
export function QuickCategories() {
  const { data, isPending } = useCategories()

  return (
    <div className="flex justify-start gap-3 md:gap-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 pb-2 pt-1 -mx-4 md:mx-0 md:px-0">
      {isPending
        ? Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-20 shrink-0 snap-start rounded-[18px] md:h-28 md:w-24" />
          ))
        : data?.filter((category) => !category.parentId).map((category) => {
            const backendImage = category.image ? mediaUrl(category.image) : null
            const assetSrc = CATEGORY_ASSETS[category.slug]
            const imageSrc = backendImage || assetSrc
            const isSvg = imageSrc?.endsWith('.svg')

            return (
              <Link
                key={category.id}
                to={category.slug === 'all' ? ROUTES.products : ROUTES.category(category.slug)}
                className="group flex flex-col items-center justify-between px-1 py-2.5 h-24 w-20 shrink-0 snap-start rounded-[18px] bg-white border border-slate-100 shadow-[0_4px_12px_rgba(120,90,40,0.04)] transition-all hover:-translate-y-0.5 md:h-28 md:w-24 md:p-3.5"
              >
                {/* Image/Icon Area */}
                <div className="flex flex-1 items-center justify-center w-full min-h-0 px-1">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={category.name}
                      loading="lazy"
                      className={isSvg ? "size-8 md:size-10 object-contain p-0.5" : "size-full object-cover rounded-lg"}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Icon name={category.icon} size={28} fill style={{ color: category.color }} />
                    </div>
                  )}
                </div>
                {/* Category Name */}
                <span className="mt-1 text-[9px] md:text-[11px] font-bold text-slate-700 leading-tight text-center w-full whitespace-normal line-clamp-2 px-0.5 group-hover:text-primary transition-colors">
                  {formatCategoryName(category.name)}
                </span>
              </Link>
            )
          })}
    </div>
  )
}
