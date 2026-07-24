import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { mediaUrl } from '@/lib/utils'
import { useCategories } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'

const CATEGORY_ASSETS: Record<string, string> = {
  all: '/icons/menu.svg',
}

/** Quick category tiles: white rounded squares with colored filled icons or custom assets. */
export function QuickCategories() {
  const { data, isPending } = useCategories()

  return (
    <div className="flex justify-between gap-1.5 md:justify-start md:gap-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 pb-2 pt-1 -mx-4 md:mx-0 md:px-0">
      {isPending
        ? Array.from({ length: 5 }, (_, i) => (
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
                className="group flex h-24 w-20 shrink-0 snap-start overflow-hidden rounded-[18px] bg-white shadow-[0_4px_12px_rgba(120,90,40,0.06)] transition-transform hover:-translate-y-0.5 md:h-28 md:w-24"
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={category.name}
                    title={category.name}
                    loading="lazy"
                    className={isSvg ? "size-full object-contain p-2.5" : "size-full object-cover"}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#faf5ec]">
                    <Icon name={category.icon} size={32} fill style={{ color: category.color }} />
                  </div>
                )}
              </Link>
            )
          })}
    </div>
  )
}
