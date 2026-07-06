import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  /** 'link' = orange text link (cream sections); 'pill' = white pill (colored blocks); 'glass' = frosted pill (glassmorphic blocks) */
  viewAllTone?: 'link' | 'pill' | 'glass'
  /** heading colors invert on colored blocks */
  onColor?: boolean
  className?: string
}

/** Section heading row: title + subtitle left, "View All →" right. */
export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All',
  viewAllTone = 'link',
  onColor = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className={cn('text-base font-bold leading-snug', onColor ? 'text-white' : 'text-foreground')}>{title}</h2>
        {subtitle && (
          <p className={cn('mt-px text-xs', onColor ? 'text-white/90' : 'text-muted-foreground')}>{subtitle}</p>
        )}
      </div>
      {viewAllHref &&
        (viewAllTone === 'glass' ? (
          <Link
            to={viewAllHref}
            className="flex shrink-0 items-center gap-1 rounded-full border border-white/60 bg-white/40 px-3.5 py-[7px] text-[11.5px] font-semibold text-[#2f4a5c] shadow-[0_2px_10px_rgba(90,130,160,0.18)] backdrop-blur-md transition-transform hover:scale-105"
          >
            {viewAllLabel}
            <Icon name="arrow_forward" size={14} />
          </Link>
        ) : viewAllTone === 'pill' ? (
          <Link
            to={viewAllHref}
            className="flex shrink-0 items-center gap-1 rounded-full border border-white/50 bg-white/20 px-3.5 py-[7px] text-[11.5px] font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] backdrop-blur-md transition-transform hover:scale-105"
          >
            {viewAllLabel}
            <Icon name="arrow_forward" size={14} />
          </Link>
        ) : (
          <Link
            to={viewAllHref}
            className="flex shrink-0 items-center gap-1 pb-0.5 text-xs font-semibold text-link hover:underline"
          >
            {viewAllLabel}
            <Icon name="arrow_forward" size={14} />
          </Link>
        ))}
    </div>
  )
}
