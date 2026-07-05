# responsive.md — PPD Store

The imported design is **mobile-first (428px)**. Desktop is an official
extension of the *same* design language — reorganized, never stretched.

## Breakpoints

Tailwind scale, tokenized in `theme/breakpoints.ts`: `xs 360 · sm 640 · md 768 ·
lg 1024 · xl 1280 · 2xl 1536`. **`md` is the pivot** where the desktop
experience begins. JS access via `hooks/use-media-query`
(`useIsDesktop`, `useBreakpointUp`) — but styling is Tailwind-first.

Validated widths: 360, 375, 390, 414 (phones) · 768 (tablet) · 1024, 1280, 1440,
1600, 1920 (desktop).

## Strategy: one component tree, responsive utilities

No separate mobile/desktop pages. Each screen uses Tailwind `md:` utilities to
adapt. The two structural swaps happen in `RootLayout`:

- **Top chrome** — mobile: per-screen `TopBar` (visible `md:hidden`). Desktop:
  `DesktopHeader` (`hidden md:block`).
- **Bottom chrome** — mobile: fixed search-pill + `BottomNav` stack. Desktop:
  hidden; navigation moves into the header.
- **Sticky action bars** (PDP, Cart) — mobile: fixed bottom bar (`md:hidden`);
  desktop: inline buttons inside the content column (`hidden md:flex`).

## Adaptations by screen

| Screen | Mobile | Desktop (≥md) |
|---|---|---|
| Content width | `max-w-md`, 16px gutter | `max-w-6xl`, 32px gutter |
| Product grids | 3 cols | 4 cols (`md`) → 5 (`xl`) |
| Home sections | full-bleed orange/red blocks | same, rounded, wider imagery |
| Product details | stacked gallery+info, sticky bar | 2-col (gallery / info), inline actions |
| Cart | list + sticky checkout bar | list + sticky summary column |
| Orders | 1-col cards | 2→3 col card grid |
| Category chips / rails | horizontal scroll | wrap / wider |

## Rules

- Adaptive spacing/type via `md:` utilities (e.g. `p-5 md:p-8`,
  `text-2xl md:text-3xl`) — never duplicate a screen per device.
- Preserve exact mobile appearance below `md`; desktop must read as the same
  designer's work (same tokens, radii, shadows, motion).
- Horizontal carousels use `.no-scrollbar` + touch scroll on mobile.
- Respect safe areas: bottom bars use `env(safe-area-inset-bottom)`.
- Test at the widths above; the body never scrolls horizontally (wide content
  scrolls inside its own container).
