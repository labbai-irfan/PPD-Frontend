/**
 * Elevation tokens — the warm brown-tinted shadows from the design.
 * Mirror of the `--shadow-*` vars in globals.css.
 */
export const shadows = {
  card: '0 5px 14px rgba(120, 90, 40, 0.06)',
  cardHover: '0 8px 20px rgba(120, 90, 40, 0.12)',
  pill: '0 4px 12px rgba(120, 90, 40, 0.08)',
  soft: '0 3px 9px rgba(120, 90, 40, 0.06)',
  glow: '0 4px 12px rgba(247, 148, 30, 0.35)', // orange CTA glow
  bar: '0 -4px 18px rgba(120, 90, 40, 0.08)', // bottom action bars
  float: '0 12px 34px rgba(60, 40, 15, 0.18)', // search overlay
} as const

export type ShadowKey = keyof typeof shadows
