# design-system.md — PPD Store

The complete design system, extracted from the imported Claude Design
(`design/PPD Store.dc.html` + `design/assets/Frame *.png`). The design is the
single source of truth; this documents how it is encoded. Token values live in
[theme.md](theme.md); component APIs in [components.md](components.md).

## Foundations

- **Color** — orange brand, cream surfaces, warm-neutral ink ramp, red/green/blue
  status. See [theme.md](theme.md).
- **Type** — Poppins 400–800; exact sizes per screen, semantic roles in
  `theme/typography.ts`.
- **Spacing** — 4px base (Tailwind scale), 16px page gutter.
- **Radius** — 10–12px inner tiles, 14–16px cards, 20px hero, fully-round pills.
- **Elevation** — warm brown-tinted shadows (card / pill / soft / glow / bar /
  float).
- **Icons** — Material Symbols Outlined via `<Icon>`; filled variant = active/brand.
- **Motion** — fade-in / slide-up; press 0.98 / hover 1.05; carousel 700ms.

## Component variants

**Button** (`ui/Button`) — pill-shaped. `primary` (orange gradient + glow),
`secondary` (soft gold), `outline`, `ghost`, `destructive`, `link`. Sizes
`sm/md/lg/icon`.

**Badges / pills** (`shared/ProductBadge`) — `ProductBadge` (auto: red *PPD
Original* for PPD brand, else green *Save X%*), `SavePill` (green), `StatusPill`
(info/success/destructive/warning soft pills).

**Cards** — white, radius 14–16, `shadow-card`. ProductCard, order card, cart
item card, profile cards, package cards all share this surface language.

**Inputs** — `ui/Input` (label, error, hint, left icon, right slot), rounded,
gold focus ring. Search uses a dedicated pill (`shared/SearchPill`).

**Rating** — `RatingBadge` (inline ★ 4.8 (49)), `RatingStars` (fractional row).
Filled star gold, empty `#D9D9D9`.

**Price** — `ui/Price`: dark price + struck MRP + optional green Save pill.

**Quantity** — `ui/QuantityStepper`: soft-gold `− qty +` pill.

**Navigation** — mobile `BottomNav` (icon-only, active = gold pill + filled
orange icon) + floating `SearchPill`; desktop `DesktopHeader` (logo, nav pills,
search, wishlist, cart chip). `CircleIconButton` for back/menu/filter.

**Feedback** — `EmptyState`, `Skeleton` (per-component skeletons), `Spinner`/
`LoadingView`, toasts via sonner, `Modal` (bottom-sheet on mobile, centered on
desktop).

**Carousel/indicators** — `BannerCarousel` (hero), `Dots` (brand/light tone),
`Pagination` (circular page dots).

## Screen catalogue

Home · Category · All Products · Product · Cart · Orders · Profile · Search
(designed) + auth · checkout · order details · wishlist · coupons · support · 404
(legacy, theme-consistent). Full behavioural notes in [brain.md](brain.md) §5.

## Governance

- Reuse before creating (check [components.md](components.md)).
- Style with tokens/utilities; fixed hex only per the rule in [theme.md](theme.md).
- Keep light rendering byte-identical to the design; dark mode is best-effort.
