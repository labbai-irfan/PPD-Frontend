import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useCategories } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'

/** Quick category tiles: white rounded squares with colored filled icons. */
export function QuickCategories() {
  const { data, isPending } = useCategories()

  return (
    <div className="flex justify-between gap-2 md:justify-start md:gap-8">
      {isPending
        ? Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="size-[58px] rounded-2xl" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))
        : data?.map((category) => (
            <Link
              key={category.id}
              to={category.slug === 'all' ? ROUTES.products : ROUTES.category(category.slug)}
              className="group flex flex-col items-center gap-1.5"
            >
              <span className="flex size-[58px] items-center justify-center rounded-2xl bg-card shadow-soft transition-transform group-hover:scale-105 md:size-16">
                <Icon name={category.icon} size={27} fill style={{ color: category.color }} />
              </span>
              <span className="text-[11px] font-medium text-ink-soft dark:text-foreground">{category.name}</span>
            </Link>
          ))}
    </div>
  )
}
