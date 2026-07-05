/**
 * Design token barrel. Import tokens from `@/theme` anywhere the JS layer
 * needs a concrete value. Tailwind utilities remain the primary styling
 * mechanism (they resolve the same values via CSS vars in globals.css).
 */
export { palette, categoryColors, statColors, type StatColorKey } from '@/theme/colors'
export { spacing, layout, type SpacingKey } from '@/theme/spacing'
export { radius, type RadiusKey } from '@/theme/radius'
export { fontFamily, fontWeight, fontSize, textRole, type FontSizeKey } from '@/theme/typography'
export { shadows, type ShadowKey } from '@/theme/shadows'
export { breakpoints, mediaQuery, testWidths, type Breakpoint } from '@/theme/breakpoints'
export { zIndex, type ZIndexKey } from '@/theme/zIndex'
export { durations, type DurationKey } from '@/theme/durations'
export { easing, animation, interaction, type EasingKey } from '@/theme/animation'
export { opacity, type OpacityKey } from '@/theme/opacity'
