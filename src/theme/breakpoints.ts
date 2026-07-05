/**
 * Responsive breakpoints. The design is mobile-first (428px frame); the
 * `md` breakpoint is where the desktop extension (header, wide grids,
 * inline action bars) takes over. Aligns with Tailwind's default scale.
 */
export const breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

/** Device widths the app is validated against (from the responsive brief). */
export const testWidths = [360, 375, 390, 414, 768, 1024, 1280, 1440, 1600, 1920] as const

export const mediaQuery = {
  up: (bp: Breakpoint) => `(min-width: ${breakpoints[bp]}px)`,
  down: (bp: Breakpoint) => `(max-width: ${breakpoints[bp] - 0.02}px)`,
} as const
