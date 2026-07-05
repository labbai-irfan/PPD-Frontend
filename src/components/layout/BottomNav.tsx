import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'

const tabs = [
  { label: 'Home', icon: 'home', to: ROUTES.home, end: true },
  { label: 'Categories', icon: 'grid_view', to: ROUTES.products, end: true },
  { label: 'Orders', icon: 'shopping_basket', to: ROUTES.orders, end: false },
  { label: 'Profile', icon: 'person', to: ROUTES.profile, end: true },
]

/**
 * The design's bottom navigation: icon-only white bar with rounded top
 * corners; the active tab sits in a light-gold pill with a filled orange icon.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="rounded-t-[24px] bg-card px-5 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 shadow-bar"
    >
      <div className="flex items-center justify-between">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            aria-label={tab.label}
            className="flex h-11 items-center justify-center"
          >
            {({ isActive }) => (
              <span
                className={cn(
                  'flex items-center justify-center rounded-full py-1.5 transition-all duration-200',
                  isActive ? 'bg-chip px-6' : 'px-4',
                )}
              >
                <Icon
                  name={tab.icon}
                  size={24}
                  fill={isActive}
                  className={isActive ? 'text-primary' : 'text-ink-muted dark:text-muted-foreground'}
                />
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
