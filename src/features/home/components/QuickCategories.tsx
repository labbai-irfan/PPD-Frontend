import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useCategories } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'

/** Quick category tiles: white rounded squares with colored filled icons. */
export function QuickCategories() {
  const { data, isPending } = useCategories()

  return (
    <div className="flex justify-between gap-1.5 md:justify-start md:gap-4 px-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 md:mx-0 md:px-0">
      {isPending
        ? Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[88px] w-[68px] shrink-0 rounded-[18px] md:h-24 md:w-[76px]" />
          ))
        : data?.map((category) => (
            <Link
              key={category.id}
              to={category.slug === 'all' ? ROUTES.products : ROUTES.category(category.slug)}
              className="group flex h-[88px] w-[68px] shrink-0 flex-col items-center justify-between rounded-[18px] bg-white pt-2.5 pb-2 shadow-[0_4px_12px_rgba(120,90,40,0.06)] transition-transform hover:-translate-y-0.5 md:h-[96px] md:w-[76px] md:pt-3 md:pb-2.5"
            >
              <div className="flex h-[42px] w-full items-center justify-center px-2 md:h-[48px]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className={category.image.endsWith('.svg') ? "size-[28px] object-contain" : "size-full object-contain"}
                  />
                ) : (
                  <Icon name={category.icon} size={28} fill style={{ color: category.color }} />
                )}
              </div>
              <span className="text-[11px] font-semibold text-[#4a463f] md:text-[12px]">{category.name}</span>
            </Link>
          ))}
    </div>
  )
}
