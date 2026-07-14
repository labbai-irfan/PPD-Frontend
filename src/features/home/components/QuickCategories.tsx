import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useCategories } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'

const CATEGORY_ASSETS: Record<string, string> = {
  all: '/icons/menu.svg',
  books: '/images/image 17.png',
  stationery: '/images/image 18.png',
  bags: '/images/image 19.png',
  'for-kids': '/images/image 20.png',
}

/** Quick category tiles: white rounded squares with colored filled icons or custom assets. */
export function QuickCategories() {
  const { data, isPending } = useCategories()

  return (
    <div className="flex justify-between gap-1.5 md:justify-start md:gap-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 pb-2 pt-1 -mx-4 md:mx-0 md:px-0">
      {isPending
        ? Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[88px] w-[68px] shrink-0 snap-start rounded-[18px] md:h-24 md:w-[76px]" />
          ))
        : data?.map((category) => {
            const assetSrc = CATEGORY_ASSETS[category.slug]

            return (
              <Link
                key={category.id}
                to={category.slug === 'all' ? ROUTES.products : ROUTES.category(category.slug)}
                className="group flex h-[88px] w-[68px] shrink-0 snap-start flex-col items-center justify-between rounded-[18px] bg-white pt-2.5 pb-2 shadow-[0_4px_12px_rgba(120,90,40,0.06)] transition-transform hover:-translate-y-0.5 md:h-[96px] md:w-[76px] md:pt-3 md:pb-2.5"
              >
                <div className="flex h-[42px] w-full items-center justify-center px-2 md:h-[48px]">
                  {assetSrc ? (
                    <img
                      src={assetSrc}
                      alt={category.name}
                      className={assetSrc.endsWith('.svg') ? "size-[28px] object-contain" : "size-full object-contain"}
                    />
                  ) : (
                    <Icon name={category.icon} size={28} fill style={{ color: category.color }} />
                  )}
                </div>
                <span className="w-full truncate px-1 text-center text-[11px] font-semibold text-[#4a463f] md:text-[12px]">{category.name}</span>
              </Link>
            )
          })}
    </div>
  )
}
