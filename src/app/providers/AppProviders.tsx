import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import type { ReactNode } from 'react'
import { useUiStore } from '@/store/ui.store'
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

  return (
    <QueryClientProvider client={queryClient}>
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
