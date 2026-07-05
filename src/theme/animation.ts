import { durations } from '@/theme/durations'

/** Easing curves used by the design's motion. */
export const easing = {
  standard: 'cubic-bezier(0.16, 1, 0.3, 1)', // decelerate — slide-up, carousel
  easeOut: 'ease-out',
  ease: 'ease',
} as const

/** Named animation presets (mirror the `--animate-*` keyframes in globals.css). */
export const animation = {
  fadeIn: `fade-in ${durations.moderate}ms ${easing.ease} both`,
  slideUp: `slide-up ${durations.slow}ms ${easing.standard} both`,
} as const

/** Interaction micro-motion shared by tappable elements. */
export const interaction = {
  pressScale: 0.98,
  hoverScale: 1.05,
} as const

export type EasingKey = keyof typeof easing
