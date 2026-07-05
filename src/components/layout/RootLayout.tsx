import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { DesktopHeader } from '@/components/layout/DesktopHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { SearchPill } from '@/components/shared/SearchPill'

/** Routes that show the floating search pill above the bottom nav (from the design). */
const SEARCH_PILL_ROUTES: string[] = [ROUTES.home, ROUTES.products, ROUTES.allProducts]
/** Tab routes that show the bottom navigation. */
const NAV_ROUTES: string[] = [ROUTES.home, ROUTES.products, ROUTES.orders, ROUTES.profile]

/**
 * App shell. Mobile follows the design's app frame: screens own their top
 * rows; a fixed bottom stack holds the search pill and icon bottom nav.
 * Desktop swaps in a header that extends the same design language.
 */
export default function RootLayout() {
  const { pathname } = useLocation()
  const showSearchPill = SEARCH_PILL_ROUTES.includes(pathname)
  const showNav = NAV_ROUTES.includes(pathname)

  return (
    <div className="min-h-dvh bg-background">
      <DesktopHeader />
      <main
        className={cn(
          'mx-auto w-full max-w-md px-4 pt-3.5 md:max-w-6xl md:px-8 md:pt-6 md:pb-16',
          showNav && showSearchPill && 'pb-[152px]',
          showNav && !showSearchPill && 'pb-[92px]',
          !showNav && showSearchPill && 'pb-[86px]',
          !showNav && !showSearchPill && 'pb-8',
        )}
      >
        <Outlet />
      </main>

      {/* Mobile fixed bottom stack */}
      {(showSearchPill || showNav) && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md md:hidden">
          {showSearchPill && (
            <div className={cn('bg-background px-4 pt-2', showNav ? 'pb-2.5' : 'pb-[calc(14px+env(safe-area-inset-bottom))]')}>
              <SearchPill />
            </div>
          )}
          {showNav && <BottomNav />}
        </div>
      )}
      <ScrollRestoration />
    </div>
  )
}
