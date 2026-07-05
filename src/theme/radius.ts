/** Corner-radius tokens (px) extracted from the design. */
export const radius = {
  none: 0,
  sm: 6,
  md: 8,
  tile: 10,
  lg: 12,
  card: 16,
  xl: 18,
  hero: 20,
  pill: 26,
  full: 9999,
} as const

export type RadiusKey = keyof typeof radius
