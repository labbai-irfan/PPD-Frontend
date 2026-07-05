# architecture.md — PPD Store

Enterprise front-end architecture reference. Read alongside [brain.md](brain.md)
(project memory) and [design-system.md](design-system.md).

## Stack

Vite 8 · React 19 · TypeScript (strict) · Tailwind CSS v4 (CSS-first) · React
Router v7 (lazy) · TanStack Query v5 · Zustand v5 (persist) · React Hook Form +
Zod · Axios · sonner. Fonts: Poppins + Material Symbols Outlined.

## Layered architecture

```
UI (screens + components)      ← presentational, consume hooks + tokens
   ↓
Feature hooks (hooks/, features/*/…)   ← view logic, React Query, selectors
   ↓
Stores (store/*.store.ts)      ← client state (cart, auth, wishlist, …)
Repositories (services/repositories)   ← THE data-access seam (mock ↔ API)
   ↓
API client (services/api/client.ts)    ← axios instance (auth, errors)
```

Rule: screens never call `axios` or `fetch` directly, never reach into another
feature's internals. Data flows up through repository → hook; actions flow down
through store methods.

## Folder structure

```
src/
  app/                 composition root
    providers/         AppProviders (React Query + Toaster)
    router.tsx         all routes, lazy-loaded
    RequireAuth.tsx    auth route guard
  theme/               design tokens (TS mirror of globals.css) — see theme.md
    colors, spacing, radius, typography, shadows,
    breakpoints, zIndex, durations, animation, opacity, index
  components/
    ui/                design-system primitives (Button, Icon, Card, Price, …)
    shared/            cross-feature commerce components (ProductCard, CartChip…)
    layout/            RootLayout, DesktopHeader, BottomNav, AuthLayout
  features/            one folder per domain (feature-based architecture)
    <feature>/
      <Feature>Page.tsx      route entry (default export)
      components/            feature-local components
      <feature>.utils.ts     feature-local pure logic
  hooks/               cross-feature hooks (use-catalog, use-cart-summary,
                       use-media-query)
  services/
    api/client.ts      axios instance
    repositories/      data access (catalog.ts) — mock today, API later
  store/               Zustand stores (*.store.ts)
  mocks/               seed data (products, categories, home, reviews)
  lib/                 framework-agnostic utils (utils, constants, recent-searches)
  types/               shared domain models
  styles/globals.css   token definitions + Tailwind theme mapping (runtime SoT)
```

## Module boundaries (import rules)

- `components/ui` → may import `lib`, `theme`. Never features or stores.
- `components/shared` → may import `ui`, `lib`, `theme`, stores, hooks.
- `features/*` → may import `ui`, `shared`, `hooks`, `services`, `store`, `theme`.
  A feature may import another feature's **public utils** (e.g. `order.utils`)
  but not its page internals.
- `services/repositories` → the only place that knows how data is fetched.
- `theme` and `lib` are leaf layers (no upward imports).

## Feature modules

`home · products · categories(→products) · search · cart · checkout · orders ·
wishlist · profile · coupons · support · auth · misc`. Each owns its page(s),
local components and utils. Shared commerce UI lives in `components/shared` to
avoid duplication across features.

## State ownership

| Concern | Owner |
|---|---|
| Server/catalog data | React Query via `hooks/use-catalog` + `repositories/catalog` |
| Cart + coupon | `store/cart.store` (+ `hooks/use-cart-summary` for derived) |
| Auth/session | `store/auth.store` (persisted, token → axios interceptor) |
| Wishlist / orders / addresses / recently-viewed | dedicated persisted stores |
| Theme / UI chrome | `store/ui.store` |

## Extending

- **New screen** → add `features/<x>/<X>Page.tsx` (default export) + a lazy route.
- **New reusable UI** → `components/ui` (generic) or `components/shared` (commerce).
  Check [components.md](components.md) first — never duplicate.
- **New data** → add a repository method; expose it via a `use-*` hook. Screens
  consume the hook only.
- **Going live** → set `VITE_API_BASE_URL`, replace repository bodies with
  `apiClient` calls. No screen/store changes required.

## Quality gates

`npm run build` (tsc strict + vite) must pass. `npm run lint` (oxlint). No
`any`, `import type` for types, no enums (erasableSyntaxOnly). See the checklist
in the task brief; every PR should satisfy it.
