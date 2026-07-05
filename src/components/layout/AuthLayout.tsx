import { Link, Outlet, ScrollRestoration } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE, ROUTES } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'

/** Minimal centered shell for login / register / password screens. */
export default function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <Link to={ROUTES.home} className="mb-8 flex flex-col items-center gap-2.5" aria-label={`${APP_NAME} home`}>
          <Logo size={52} />
          <span className="text-center leading-tight">
            <span className="block text-xl font-extrabold text-foreground">{APP_NAME}</span>
            <span className="block text-xs font-medium text-muted-foreground">{APP_TAGLINE}</span>
          </span>
        </Link>
        <Outlet />
      </div>
      <ScrollRestoration />
    </div>
  )
}
