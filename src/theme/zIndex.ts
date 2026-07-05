/**
 * Z-index scale — one place for stacking order so overlays never fight.
 */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  header: 40,
  bottomStack: 40, // mobile search pill + bottom nav
  actionBar: 40, // sticky PDP/cart footers
  overlay: 50, // modals, search overlay, bottom sheets
  toast: 60,
} as const

export type ZIndexKey = keyof typeof zIndex
