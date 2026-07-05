# performance.md — PPD Store

## In place

- **Route-level code splitting** — every page is `lazy()`-loaded in
  `app/router.tsx`; the initial route ships only its chunk (see `dist/assets/*`
  per-page bundles ~1–15 kB gz).
- **React Query caching** — `staleTime` 60s / `gcTime` 5m / `retry` 1 / no
  refetch-on-focus; `keepPreviousData` on paginated listings so pages/filter
  changes don't flash empty. Centralized query keys prevent cache fragmentation.
- **Persisted client state** — cart/wishlist/orders/auth hydrate from
  `localStorage` (no network on boot for these).
- **Image loading** — `loading="lazy"` on all catalog/product imagery;
  fixed aspect-ratio containers (`aspect-square`, fixed heights) reserve space to
  avoid layout shift (CLS).
- **CSS-first Tailwind v4** — utilities compile to a single small stylesheet
  (~10 kB gz); design tokens are CSS vars (no runtime theme JS beyond the class
  toggle). Pre-paint theme script avoids a flash.
- **Fonts** — `preconnect` + `display=swap`/`block`; only the needed Poppins
  weights and one Material Symbols axis range are requested.
- **Derived-state centralization** — cart totals live in one selector
  (`getCartTotals` / `useCartSummary`); avoids recomputing across components.

## Guidelines for new work

- Keep pages lazy; keep heavy/rarely-used widgets behind `lazy` too.
- Reuse `ProductGrid`/`ProductCard` (memo-friendly, stable props) rather than
  bespoke lists. For very long lists, introduce list virtualization
  (`@tanstack/virtual`) — not needed yet at current catalogue size.
- Memoize only measured hot paths (`React.memo`/`useMemo`/`useCallback` where a
  profiler shows re-render cost). Avoid premature memoization.
- Fetch through repository + React Query; never fetch in render. Prefer
  `select`/derived hooks over duplicating transforms.
- Add `width`/`height` or aspect containers to any new imagery; keep
  `loading="lazy"`.

## Budgets / watch

- Initial JS (shared `index` chunk) ≈ 108 kB gz — mostly React + Router + Query.
  Watch when adding libraries; prefer tree-shakeable imports.
- `Input` chunk is large due to RHF+Zod on auth/checkout — already split per
  route, so it only loads on those pages.
