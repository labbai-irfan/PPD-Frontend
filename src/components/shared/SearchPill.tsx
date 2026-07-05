import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'

/**
 * The floating "Search by product name" pill that sits above the bottom nav
 * on the designed screens. Tapping it opens the search overlay.
 */
export function SearchPill({ className }: { className?: string }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.search)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-full bg-card px-[18px] py-[13px] text-left shadow-pill cursor-pointer',
        className,
      )}
    >
      <Icon name="search" size={21} className="text-faint-foreground" />
      <span className="flex-1 truncate text-[13.5px] text-faint-foreground">Search by product name</span>
      <Icon name="mic" size={21} className="text-accent" />
    </button>
  )
}
