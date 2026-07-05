/** Opacity tokens used for overlays, disabled states and layered surfaces. */
export const opacity = {
  disabled: 0.55,
  muted: 0.7,
  overlay: 0.28, // search overlay scrim (rgba brown 0.28)
  scrim: 0.5, // modal backdrop
  onColorSubtle: 0.9, // white text on colored banners
  divider: 0.12,
} as const

export type OpacityKey = keyof typeof opacity
