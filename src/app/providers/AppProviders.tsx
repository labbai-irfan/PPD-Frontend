import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useEffect, type ReactNode } from 'react'
import { useUiStore } from '@/store/ui.store'
import { useSettingsStore } from '@/store/settings.store'
import { SEOTags } from '@/components/shared/SEO'
import NoInternetPage from '@/pages/NoInternetPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)

  /* App-wide config (site name, SEO defaults) — needed by SEOTags on every route, admin included */
  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  return (
    <QueryClientProvider client={queryClient}>
      <SEOTags />
      {children}
      <Toaster
        position="bottom-center"
        theme={theme}
        toastOptions={{ style: { borderRadius: '12px' } }}
        mobileOffset={{ bottom: 84 }}
      />
      <NoInternetPage />
    </QueryClientProvider>
  )
}
