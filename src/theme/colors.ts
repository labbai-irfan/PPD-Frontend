/**
 * Color tokens — TS mirror of the CSS custom properties in
 * `src/styles/globals.css` (the runtime source of truth for Tailwind).
 *
 * Components style with Tailwind utilities that resolve these via CSS vars;
 * this file exists for the JS layer (chart/data colors, inline `style`,
 * canvas, etc.) and as a typed, documented contract. Keep the two in sync —
 * globals.css `:root` light values are authoritative.
 */

/** Raw brand palette (light theme values). */
export const palette = {
  cream: '#FDF1E1',
  creamAlt: '#FCF3E9',
  white: '#FFFFFF',

  orange: '#F7941E',
  orangeDeep: '#F5860C',
  orangeGold: '#F5A623',
  link: '#F2790C',
  chip: '#FCE3B8',
  chipText: '#C77A12',
  soft: '#FBEAD3',
  softText: '#8A5A1A',

  red: '#E23744',
  redSoft: '#FBE3E6',
  green: '#1FA463',
  greenSoft: '#E4F6EA',
  greenDeep: '#1B7A43',
  blue: '#2B7CB8',
  blueSoft: '#D6ECFB',

  // Warm-neutral ink ramp
  ink900: '#24211E',
  ink800: '#2A2723',
  ink700: '#3A3733',
  ink600: '#4A463F',
  ink500: '#5A544B',
  ink400: '#6B645B',
  ink300: '#736C63',
  ink200: '#8C857C',
  ink100: '#A7A099',
  iconIdle: '#B0A99F',

  border: '#F0E6D6',
  borderStrong: '#ECDFCB',
  rule: '#EADDC8',
  ruleSoft: '#F4ECDF',
  ratingEmpty: '#D9D9D9',
  dot: '#E6D8C4',
} as const

/**
 * Category accent colors from the imported design (icon tint per category).
 * Keyed by category slug so data/config never hardcodes hex.
 */
export const categoryColors: Record<string, string> = {
  all: palette.orange,
  books: palette.red,
  stationery: palette.orangeGold,
  bags: palette.green,
  'for-kids': '#7B61FF',
}

/** Profile "My Orders" stat tiles — icon color + soft background pairs. */
export const statColors = {
  all: { color: palette.link, bg: '#FEF0DC' },
  processing: { color: palette.blue, bg: '#E0EFFA' },
  delivered: { color: palette.green, bg: '#E3F5EC' },
  cancelled: { color: palette.red, bg: '#FBE3E6' },
} as const

export type StatColorKey = keyof typeof statColors
