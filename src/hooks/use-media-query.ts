import { useSyncExternalStore } from 'react'
import { mediaQuery, type Breakpoint } from '@/theme/breakpoints'

/**
 * Subscribe to a CSS media query. SSR-safe via useSyncExternalStore; returns
 * false during server render. Prefer Tailwind responsive utilities for
 * styling — use this only when layout logic must branch in JS (e.g. rendering
 * a different component tree on desktop, not just restyling one).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True when the viewport is at or above the given breakpoint. */
export function useBreakpointUp(bp: Breakpoint): boolean {
  return useMediaQuery(mediaQuery.up(bp))
}

/** Convenience: desktop = ≥ md (where the design's desktop extension begins). */
export function useIsDesktop(): boolean {
  return useBreakpointUp('md')
}
