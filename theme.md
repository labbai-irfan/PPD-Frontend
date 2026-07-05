# theme.md — PPD Store Design Tokens

## Two synchronized sources

1. **`src/styles/globals.css`** — the **runtime source of truth**. CSS custom
   properties on `:root` (light) and `.dark`, mapped to Tailwind utilities via
   `@theme inline`. Components style with Tailwind classes (`bg-primary`,
   `text-ink`, `shadow-card`) that resolve these vars.
2. **`src/theme/*.ts`** — a **typed TS mirror** for the JS layer (data-driven
   colors, inline `style`, measurements, motion). Import from `@/theme`.

Keep them in sync: globals.css light values are authoritative; the TS `palette`
mirrors them. When adding a color, add it in **both** (CSS var + `@theme`
mapping, and `palette`/token file).

## Token files (`src/theme/`)

| File | Exports |
|---|---|
| `colors.ts` | `palette`, `categoryColors`, `statColors` |
| `spacing.ts` | `spacing` (4px scale), `layout` (gutter, max-widths, header) |
| `radius.ts` | `radius` (sm…pill, card 16, hero 20, pill 26) |
| `typography.ts` | `fontFamily`, `fontWeight`, `fontSize`, `textRole` |
| `shadows.ts` | `shadows` (card, cardHover, pill, soft, glow, bar, float) |
| `breakpoints.ts` | `breakpoints`, `mediaQuery`, `testWidths` |
| `zIndex.ts` | `zIndex` (base…toast) |
| `durations.ts` | `durations` (ms) |
| `animation.ts` | `easing`, `animation`, `interaction` |
| `opacity.ts` | `opacity` |
| `index.ts` | barrel — `import { palette, spacing } from '@/theme'` |

## Color system

**Brand** — orange `#F7941E` (`--primary`, hover `#F5860C`), gradients via
utility classes (`.bg-grad-primary/-hero/-trending/-red/-monsoon/-yoga`), icon
gold `#F5A623` (`--accent`), link `#F2790C` (`--link`).

**Surfaces** — cream `#FDF1E1` (`--background`), product-page `#FCF3E9`
(`--background-alt`), card white, muted `#F6ECDC`, search overlay card
`#FCF2E4` (`--surface-search`), image placeholder `#F5F3F1`
(`--surface-placeholder`).

**Ink ramp** (warm neutrals, theme-aware) — `--ink` #3A3733 · `--ink-soft`
#4A463F · `--ink-muted` #5A544B · `--ink-label` #6B645B · `--subtle-foreground`
#736C63 · `--muted-foreground` #8C857C · `--faint-foreground` #A7A099 ·
`--icon-idle` #B0A99F. Utilities: `text-ink`, `text-ink-soft`, etc.

**Status** — `--destructive`/`--deal` red #E23744 (PPD logo, PPD Original,
sale) · `--success` green #1FA463 (Save pills, delivery, "you save") ·
`--info` blue #2B7CB8 (status pills, Student Profile). Each has a `-soft`
background variant.

**Commerce** — `--rating` gold star, `--rating-empty` #D9D9D9, `--dot` #E6D8C4.

**Lines** — `--border` #F0E6D6, `--border-strong` #ECDFCB, `--rule` #EADDC8,
`--rule-soft` #F4ECDF.

## Rule: fixed hex is allowed ONLY on always-colored surfaces

Most colors are theme-aware tokens. **Exception:** text/icons that sit on an
always-fixed background — white pills inside gradient banners, the always-white
marketing cards (Trending, House of PPD inner cards, Yoga promos), and tinted
seasonal tiles — keep **fixed hex** so they stay readable in *both* light and
dark (a theme-aware token would turn light in dark mode and vanish on the white
card). These are illustration colors, not magic numbers. Everywhere else uses
tokens. Remaining fixed hex is catalogued in [components.md](components.md).

## Typography

Poppins (400/500/600/700/800). Sizes are exact from the design; recurring roles
in `typography.ts#textRole` (greeting 26/700, sectionTitle 16/700, pdpPrice
27/700, cta 15/700, productTitle 10/500…).

## Elevation

Warm brown-tinted shadows (`rgba(120,90,40,…)`): `shadow-card`, `-cardHover`,
`-pill`, `-soft`, `-glow` (orange CTA), `-bar` (bottom bars), `-float` (search).

## Motion

`--animate-fade-in`, `--animate-slide-up` (keyframes in globals.css; mirrored in
`animation.ts`). Easing `cubic-bezier(0.16,1,0.3,1)`. Press scale 0.98, hover
1.05. Durations in `durations.ts` (carousel slide 700ms, autoplay 4500ms).

## Dark mode

Design ships light-first (default theme = light). A warm-dark equivalent
(`#1C1712` bg) keeps the Profile → Preferences toggle working; every token has a
dark value. Always-white marketing cards intentionally stay light in dark mode.
