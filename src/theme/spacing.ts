/**
 * Spacing scale (px) — matches Tailwind's 4px base used throughout the design.
 * Prefer Tailwind spacing utilities in components; use these constants only
 * where JS needs a numeric value (measurements, inline style, animation).
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const

/** Design page gutter (mobile) and content max-widths. */
export const layout = {
  gutter: 16,
  mobileMaxWidth: 448, // max-w-md
  desktopMaxWidth: 1152, // max-w-6xl
  headerHeight: 64,
} as const

export type SpacingKey = keyof typeof spacing
