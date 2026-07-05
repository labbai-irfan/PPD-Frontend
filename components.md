# components.md — Reusable Component Inventory

Check here before building UI. Reuse existing; extend, don't duplicate.
Props shown are the notable ones.

## `components/ui/` — design-system primitives

| Component | Purpose | Key props |
|---|---|---|
| `Icon` | Material Symbols icon | `name, size, fill, weight, style` |
| `Button` | pill button (+`buttonVariants`) | `variant, size, loading, leftIcon, rightIcon` |
| `Input` | labelled text field | `label, error, hint, leftIcon, rightSlot` |
| `Card` | white rounded surface | — |
| `Badge` | generic badge | `variant` |
| `Avatar` | initials/photo circle | `name, src, size` |
| `Price` | price + MRP + Save pill | `price, mrp, size, showSave` |
| `Rating` | `RatingBadge`, `RatingStars` | `rating, count, size` |
| `QuantityStepper` | − qty + pill | `value, min, max, onChange, size` |
| `CircleIconButton` | round icon button | `icon, label, tone(light/solid), size` |
| `Dots` | carousel dots | `count, active, tone, onSelect` |
| `Pagination` | circular page nav | `page, totalPages, onChange` |
| `Modal` | sheet/dialog | `open, onClose, title` |
| `EmptyState` | empty/error placeholder | `icon, title, description, action` |
| `Skeleton` | shimmer block | — |
| `Spinner` / `LoadingView` | inline / full loader | `label` |

## `components/shared/` — commerce components

| Component | Purpose |
|---|---|
| `ProductCard` (+`ProductCardSkeleton`) | catalog card; auto badge + round add-to-cart |
| `ProductGrid` | responsive 3→4→5 col grid (loading skeletons) |
| `ProductBadge` / `SavePill` / `StatusPill` | badges/pills |
| `CartChip` | header cart-count pill (light/solid) |
| `SearchPill` | floating "Search by product name" trigger |
| `TopBar` | mobile screen top row (back/menu + cart chip + title) |
| `SectionHeader` | title + subtitle + View All (link/pill, onColor) |
| `BannerCarousel` | hero banner + dots |
| `WishlistButton` | bare heart toggle |
| `PpdLogo` | red PPD mark |

## `components/layout/`

`RootLayout` (shell: desktop header / content / mobile bottom stack) ·
`DesktopHeader` · `BottomNav` · `AuthLayout`.

## `features/home/components/`

`QuickCategories` · `TrendingSection` · `HouseOfPpdSection` · `MonsoonSection` /
`YogaSection` (SeasonalSections) · `BundleBanner` / `PackagesSection`.

## Hooks

| Hook | Purpose |
|---|---|
| `hooks/use-catalog` | React Query: products, product, related, byIds, categories, banners, homeContent, reviews, coupons |
| `hooks/use-cart-summary` | derived cart figures (totals, itemCount, savingsPct) |
| `hooks/use-media-query` | `useMediaQuery`, `useBreakpointUp`, `useIsDesktop` |

## Shared logic modules

- `features/orders/order.utils` — `orderStatusMeta`, `ORDER_TABS`,
  `matchesOrderTab`, `expectedDelivery`, `orderItemCount` (used by Orders +
  Order Details).
- `store/cart.store#getCartTotals` — single pricing source.
- `lib/recent-searches` — recent search history.
- `lib/utils` — `cn`, `formatCurrency`, `discountPercent`, `formatDate`, `sleep`,
  `clamp`, `uid`.

## Intentional fixed-hex spots (per theme.md rule)

Always-colored surfaces keep fixed hex on purpose: `BannerCarousel` /
`SectionHeader` / `PackagesSection` white CTA pills (`#3a3733`); `TrendingSection`,
`HouseOfPpdSection`, `SeasonalSections` always-white cards (`#2a2723`, `#6b645b`,
`#a7a099`, `#c23`, tile label `#3a4045`, image placeholders); `ProductDetailsPage`
divider pipe `#d8cfc2` and green-banner subtext `#4a8a63`. Everything else = tokens.

## Not yet built (create when a design/story needs them)

`OTPInput, Checkbox, Radio, Switch, Tabs (as a component), BottomSheet (distinct
from Modal), OfflineState, Carousel (generic), FloatingActionButton`. These were
**intentionally not** pre-built — unused components are dead abstraction. Add when
a screen requires them, following the patterns above.
