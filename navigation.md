# navigation.md — PPD Store

Routes are declared in `src/app/router.tsx` and always referenced through the
`ROUTES` map in `src/lib/constants.ts` (never hardcoded paths).

## Route graph

```
RootLayout (desktop header + mobile bottom stack)
├─ /                         Home                     [tab] [search pill]
├─ /products                 Category listing         [tab] [search pill]
├─ /products/all             All Products (filters)         [search pill]
├─ /product/:id              Product details
├─ /categories               → redirect → /products
├─ /search                   Search overlay
├─ /cart                     Cart
├─ /wishlist                 Wishlist
├─ /coupons                  Coupons
├─ /support                  Support / FAQ
├─ /orders                   Orders                   [tab]
├─ /orders/:id               Order details
├─ RequireAuth
│   ├─ /checkout             Checkout
│   ├─ /checkout/success/:orderId   Order success
│   └─ /profile              Profile                  [tab]
└─ *                         404

AuthLayout
├─ /auth/login
├─ /auth/register
└─ /auth/forgot-password
```

`[tab]` = appears in the mobile `BottomNav` (Home, Categories→/products,
Orders, Profile). `[search pill]` = floating search pill shown above the nav
(Home, Category, All Products).

## Navigation patterns

- **Mobile:** each screen renders its own `TopBar` (back/menu + cart chip); no
  persistent app header. Fixed bottom stack (search pill + bottom nav) lives in
  `RootLayout`, shown only on tab/pill routes.
- **Desktop (≥md):** `DesktopHeader` replaces per-screen top rows; bottom stack
  hidden; sticky mobile action bars become inline buttons.
- **Back:** `TopBar` back button uses `navigate(-1)`; Search overlay closes with
  the ✕ or Escape.

## Guards & flows

- `RequireAuth` redirects unauthenticated users to `/auth/login`, preserving the
  intended destination in `location.state.from` (restored after login).
- **Buy Now / Checkout:** product → cart → `/checkout` (guarded) → place order →
  `/checkout/success/:orderId`.
- **Search:** any search pill → `/search` overlay → submit → `/products/all?q=…`
  (recent searches persisted in `lib/recent-searches`).

## Deep-linking

All routes are URL-driven. Listing filters/sort/page and search queries live in
URL search params (`?category=&sort=&page=&q=`), so listing and search states are
shareable and restorable. Product/order pages key off the path param.
