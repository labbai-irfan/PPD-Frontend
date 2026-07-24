import { Link, NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { APP_NAME, APP_TAGLINE, ROUTES } from '@/lib/constants'
import { Icon } from '@/components/ui/Icon'
import { CartChip } from '@/components/shared/CartChip'
import { Logo } from '@/components/shared/Logo'

const navLinks = [
  { label: 'Home', to: ROUTES.home, end: true },
  { label: 'Categories', to: ROUTES.products, end: true },
  { label: 'Orders', to: ROUTES.orders, end: false },
  { label: 'Profile', to: ROUTES.profile, end: true },
]

/**
 * Desktop extension of the mobile design: same cream surface, white pills,
 * gold accents. Hidden on mobile where each screen owns its header.
 */
export function DesktopHeader() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur-lg md:block">
      <div className="mx-auto flex h-(--header-h) max-w-6xl items-center gap-3 px-4 lg:gap-6 lg:px-8">
        <Link to={ROUTES.home} className="flex items-center gap-2.5" aria-label={`${APP_NAME} home`}>
          <Logo size={38} />
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold text-foreground">{APP_NAME}</span>
            <span className="hidden lg:block text-[10px] font-medium text-muted-foreground">{APP_TAGLINE}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 lg:px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-chip text-primary-soft-foreground' : 'text-subtle-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => navigate(ROUTES.search)}
          className="flex h-11 max-w-xs lg:max-w-md flex-1 items-center gap-2.5 rounded-full bg-card px-4 text-left shadow-pill cursor-pointer"
        >
          <Icon name="search" size={20} className="text-faint-foreground" />
          <span className="flex-1 truncate text-[13px] text-faint-foreground">Search by product name</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <Link
            to={ROUTES.wishlist}
            aria-label="Wishlist"
            className="flex size-11 items-center justify-center rounded-full bg-card shadow-pill transition-transform hover:scale-105"
          >
            <Icon name="favorite" size={20} className="text-ink-muted dark:text-muted-foreground" />
          </Link>
          <CartChip />
        </div>
      </div>
    </header>
  )
}
