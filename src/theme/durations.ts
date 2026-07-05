/** Motion durations (ms) used across transitions and animations. */
export const durations = {
  instant: 0,
  fast: 150,
  base: 200,
  moderate: 250,
  slow: 300,
  slower: 500,
  carousel: 700, // banner/track slide
  carouselInterval: 4500, // autoplay dwell
} as const

export type DurationKey = keyof typeof durations
