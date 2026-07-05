/**
 * Typography tokens — Poppins, with the exact sizes/weights the design uses.
 * Named text roles map to the recurring styles across screens.
 */
export const fontFamily = {
  sans: '"Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

/** Font sizes (px) present in the design. */
export const fontSize = {
  '2xs': 8.5,
  xs: 10,
  '11': 11,
  '12': 12,
  '12.5': 12.5,
  sm: 13,
  '13.5': 13.5,
  base: 14,
  '15': 15,
  md: 16,
  lg: 17,
  xl: 19,
  '2xl': 21,
  '3xl': 22,
  hero: 26,
  price: 27,
} as const

/** Semantic text roles → (size, weight) used repeatedly across screens. */
export const textRole = {
  greeting: { size: fontSize.hero, weight: fontWeight.bold },
  sectionTitle: { size: fontSize.md, weight: fontWeight.bold },
  sectionSubtitle: { size: fontSize['12'], weight: fontWeight.regular },
  productTitle: { size: fontSize.xs, weight: fontWeight.medium },
  productPrice: { size: fontSize['15'], weight: fontWeight.bold },
  pdpTitle: { size: fontSize['2xl'], weight: fontWeight.bold },
  pdpPrice: { size: fontSize.price, weight: fontWeight.bold },
  cta: { size: fontSize['15'], weight: fontWeight.bold },
} as const

export type FontSizeKey = keyof typeof fontSize
