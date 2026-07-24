import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { APP_NAME, BRAND_LINE, ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from '@/components/ui/Avatar'

interface DrawerLink {
  icon: string
  label: string
  href: string
  highlight?: boolean
}

const accountLinks: DrawerLink[] = [
  { icon: 'receipt_long', label: 'My Orders', href: ROUTES.orders },
  { icon: 'location_on', label: 'My Addresses', href: ROUTES.addresses },
]

const helpLinks: DrawerLink[] = [
  { icon: 'help', label: 'Help Center', href: ROUTES.help },
  { icon: 'support_agent', label: 'Contact Us', href: ROUTES.contactUs },
  { icon: 'quiz', label: 'FAQs & Support', href: ROUTES.support },
  { icon: 'gavel', label: 'Terms & Conditions', href: ROUTES.terms },
  { icon: 'info', label: `About ${APP_NAME}`, href: ROUTES.about },
]

function DrawerSection({ title, links }: { title: string; links: DrawerLink[] }) {
  return (
    <div className="px-3 pt-4">
      <p className="px-2.5 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              to={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-primary/10 active:bg-primary/15',
                link.highlight && 'bg-primary/10 text-primary',
              )}
            >
              <Icon name={link.icon} size={19} className={cn('text-subtle-foreground', link.highlight && 'text-primary')} />
              {link.label}
              {link.highlight && <Icon name="arrow_forward" size={15} className="ml-auto text-primary" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** App menu drawer, opened by the hamburger buttons. Mobile-first slide-in from the left. */
export function MenuDrawer() {
  const open = useUiStore((s) => s.mobileMenuOpen)
  const setOpen = useUiStore((s) => s.setMobileMenuOpen)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  const shopLinks: DrawerLink[] = [
    { icon: 'category', label: 'Categories', href: ROUTES.products },
    { icon: 'inventory_2', label: 'All Products', href: ROUTES.allProducts },
    { icon: 'fiber_new', label: 'New Arrivals', href: '/products/all?tag=new' },
    { icon: 'favorite', label: `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`, href: ROUTES.wishlist },
  ]

  /* Close whenever navigation happens (link tapped, back button, etc.) */
  useEffect(() => {
    setOpen(false)
  }, [pathname, search, setOpen])

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className={cn('fixed inset-0 z-50', !open && 'pointer-events-none')} aria-hidden={!open}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className={cn(
          'absolute inset-0 w-full bg-black/40 transition-opacity duration-300 cursor-default',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Panel */}
      <aside
        className={cn(
          'absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col overflow-y-auto rounded-r-3xl bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#F7941E] to-[#FBAA2E] px-5 pb-5 pt-6 text-white">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 cursor-pointer"
          >
            <Icon name="close" size={18} className="text-white" />
          </button>

          <Logo size={40} />
          {user ? (
            <div className="mt-3 flex items-center gap-3">
              <Avatar
                name={user.name}
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}`
                    : undefined
                }
                size={52}
                className="border-2 border-white/40"
              />
              <div className="min-w-0">
                <p className="truncate text-[17px] font-extrabold leading-tight">{user.name}</p>
                <p className="mt-0.5 truncate text-[12px] text-white/85">{user.email}</p>
                <Link
                  to={ROUTES.profile}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-3.5 py-1.5 text-[11.5px] font-bold backdrop-blur transition-colors hover:bg-white/30"
                >
                  View profile
                  <Icon name="arrow_forward" size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[16px] font-extrabold leading-tight">Welcome to {APP_NAME}!</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-white/85">{BRAND_LINE}</p>
              <Link
                to={ROUTES.login}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-[#F7941E] shadow transition-transform hover:scale-[1.03]"
              >
                Login / Sign up
                <Icon name="arrow_forward" size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="flex-1 pb-4">
          <DrawerSection title="Shop" links={shopLinks} />
          {user && <DrawerSection title="My Account" links={accountLinks} />}
          <DrawerSection title="Help & Info" links={helpLinks} />
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3.5">
          {user && (
            <button
              type="button"
              onClick={() => {
                logout()
                setOpen(false)
                navigate(ROUTES.home)
              }}
              className="mb-3 flex w-full items-center gap-3 rounded-xl px-1 py-2 text-[13.5px] font-bold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
            >
              <Icon name="logout" size={19} />
              Logout
            </button>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Link to={ROUTES.terms} className="hover:text-foreground">Terms</Link>
            <span aria-hidden>·</span>
            <Link to={ROUTES.privacy} className="hover:text-foreground">Privacy</Link>
            <span className="ml-auto">© {APP_NAME} Store</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
