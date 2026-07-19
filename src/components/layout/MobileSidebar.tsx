import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { Icon } from '@/components/ui/Icon'
import { Avatar } from '@/components/ui/Avatar'

export function MobileSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const mobileMenuOpen = useUiStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen)

  // Close sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  // Prevent background scrolling when open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  if (!user) return null

  const menu = [
    { label: 'My Orders', icon: 'local_shipping', onClick: () => navigate(ROUTES.orders) },
    { label: 'My Wishlist', icon: 'favorite', onClick: () => navigate(ROUTES.wishlist) },
    { label: 'Saved Address', icon: 'import_contacts', onClick: () => navigate(ROUTES.addresses) },
    { label: 'Account Settings', icon: 'manage_accounts', onClick: () => navigate(ROUTES.accountSettings) },
    { label: 'Help & Support', icon: 'support_agent', onClick: () => navigate(ROUTES.support) },
    { label: 'About PPD', icon: 'info', onClick: () => navigate(ROUTES.about) },
    {
      label: 'Log out',
      icon: 'logout',
      onClick: () => {
        setMobileMenuOpen(false)
        logout()
        toast('Signed out. See you soon!')
        navigate(ROUTES.home)
      },
    },
  ]

  return (
    <>
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-card shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] md:hidden flex flex-col overflow-hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Premium Header */}
        <div className="relative flex flex-col bg-primary px-6 pb-8 pt-10 text-primary-foreground overflow-hidden shrink-0">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-primary-foreground/80 transition-all hover:bg-black/10 hover:text-primary-foreground active:scale-95 z-10"
          >
            <Icon name="close" size={24} />
          </button>

          <Link 
            to={ROUTES.profile} 
            onClick={() => setMobileMenuOpen(false)} 
            className="group relative z-10 flex flex-col items-start gap-4 mt-2"
          >
            <div className="relative rounded-full border-2 border-primary-foreground/40 p-1 transition-all duration-300 group-hover:border-primary-foreground/80">
              <Avatar
                name={user.name}
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}`
                    : undefined
                }
                size={72}
              />
            </div>
            <div className="flex flex-col min-w-0 w-full gap-0.5">
              <h2 className="truncate text-[22px] font-bold text-primary-foreground">{user.name}</h2>
              <p className="truncate text-sm font-medium text-primary-foreground/80">{user.email}</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
          <nav className="flex flex-col space-y-1">
            {menu.map((item, i) => {
              const isLogout = item.label === 'Log out';
              return (
                <div key={item.label} className="w-full">
                  {isLogout && <div className="my-4 h-px w-full bg-border/50" />}
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-200',
                      isLogout 
                        ? 'hover:bg-destructive/10 text-destructive' 
                        : 'hover:bg-primary/5 text-card-foreground'
                    )}
                  >
                    <div className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                      isLogout ? 'bg-destructive/10 group-hover:bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                    )}>
                      <Icon
                        name={item.icon}
                        size={22}
                        className="transition-colors"
                      />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-background/50 shrink-0">
          <div className="flex items-center justify-center gap-1.5 opacity-60">
            <span className="text-xs font-semibold text-foreground">PPD Store</span>
            <span className="size-1 rounded-full bg-foreground/40" />
            <span className="text-xs font-semibold text-foreground">v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  )
}
