# 🧠 brain.md — PPD Store Project Memory

> **Read this file before writing any code. Update it after every completed task.**
> This is the permanent source of truth for the project.
>
> 📚 **Companion docs** (read for their area, keep updated): [architecture.md](architecture.md) ·
> [design-system.md](design-system.md) · [theme.md](theme.md) · [components.md](components.md) ·
> [navigation.md](navigation.md) · [api.md](api.md) · [performance.md](performance.md) · [responsive.md](responsive.md)

---

## 1. Project Vision

**PPD Store** — "Everything for School". E-commerce web app for an Indian educational publisher (PPD, "India's Trusted Educational Publisher since 1926") selling school books, stationery, bags and kids' items.

⚠️ **Platform (2026-07-05):** React **WEB** app (Vite + React + TS). The user explicitly rejected React Native/Expo. Never reintroduce it.

🎨 **Design source of truth (2026-07-05):** The imported Claude Design file at **`design/PPD Store.dc.html`** + screenshots in **`design/assets/Frame *.png`** (from `C:\Users\S\Downloads\PPD Store.dc.html` / `PPD.zip`; Claude Design project `a3ab06e4-10dd-449c-b4ef-b03144064505`, file "PPD Store copy.dc.html" — DesignSync MCP auth unavailable in this environment, local export used instead). The design is **mobile (428px)**; desktop is our responsive extension of the same language. Recreate faithfully — do not redesign.

## 2. Tech Stack

Vite 8 · React 19 · TS strict · Tailwind v4 (CSS-first, no config file) · React Router v7 (lazy routes) · TanStack Query v5 · Zustand v5 (persist) · RHF + Zod v4 · Axios (mock repositories for now) · sonner · **Poppins** font + **Material Symbols Outlined** icons (both via Google Fonts links in index.html). `@/*` → `src/*`. lucide-react still installed — legacy screens only (see §9).

## 2b. Architecture layer (2026-07-05 — enterprise refactor)

Role shifted to "architecture, no visual change." Added:
- **`src/theme/`** — typed token layer mirroring globals.css (colors, spacing, radius, typography, shadows, breakpoints, zIndex, durations, animation, opacity, `index` barrel). Import via `@/theme`. globals.css `:root` is the runtime SoT; theme/*.ts serves the JS layer (data colors, inline style, measurements). See [theme.md](theme.md).
- **Tokenized colors** — added `--ink/-soft/-muted/-label`, `--icon-idle`, `--surface-placeholder/-search`, `--rule/-soft` (exact hex, theme-aware). Swapped ~45 arbitrary `[#hex]` utilities → tokens on theme-aware surfaces; light rendering is byte-identical. **Fixed hex kept only on always-colored surfaces** (white CTA pills, always-white marketing cards, tinted tiles) — documented rule in theme.md + list in components.md.
- **Data colors** — `categoryColors` + `statColors` in `theme/colors.ts`; consumed by `mocks/categories` and ProfilePage (removed inline hex data).
- **Shared logic extracted** — `features/orders/order.utils.ts` (orderStatusMeta/ORDER_TABS/matchesOrderTab/expectedDelivery/orderItemCount — used by Orders + OrderDetails; `orderStatusMeta` no longer re-imported across pages), `hooks/use-cart-summary.ts` (derived cart figures), `hooks/use-media-query.ts` (`useMediaQuery/useBreakpointUp/useIsDesktop`).
- **Docs suite** at repo root (see header). Update the relevant doc with every change.
- Deliberately **did NOT** create speculative unused UI components (OTPInput/Switch/BottomSheet/…) or device-specific layout files (Tablet/DesktopLayout) — unused abstraction + per-device layouts are anti-patterns; responsive = one tree + `md:` utilities. Tracked in components.md "Not yet built".

## 3. Design System (src/styles/globals.css — extracted from the design)

- **Palette:** bg cream `#FDF1E1` (`--background`; product-page variant `#FCF3E9` = `--background-alt`), card white, text `#24211E`, subtitles `#736C63` (`subtle-foreground`), muted `#8C857C`, faint `#A7A099`, borders `#F0E6D6`/`#ECDFCB`.
- **Brand orange:** primary `#F7941E`, hover `#F5860C`, gradients via utility classes: `.bg-grad-primary` (CTAs 100deg #FBAA2E→#F5860C), `.bg-grad-hero` (banners), `.bg-grad-trending` (180deg), `.bg-grad-red` (House of PPD #E5433F→#D42E2A), `.bg-grad-monsoon` (blue tint), `.bg-grad-yoga` (purple tint).
- **Accents:** icon gold `#F5A623` (`--accent`), link orange `#F2790C` (`--link`, `text-link`), soft chip `#FBEAD3` (`primary-soft`, text `#8A5A1A`), trending chip `#FCE3B8` (`--chip`, text `#C77A12`).
- **Status:** red `#E23744` (`destructive`/`deal` — PPD logo, PPD Original badge), green `#1FA463` (`success` — Save pills, delivery banner; soft `#E4F6EA`, deep text `#1B7A43`), info blue `#2B7CB8` (+soft `#D6ECFB` — status pills, Student Profile).
- **Commerce:** star gold `rating`, empty `#D9D9D9`, inactive dots `#E6D8C4` (`--dot`).
- **Shadows (warm):** `shadow-card` 0 5px 14px rgba(120,90,40,.06) · `shadow-pill` · `shadow-soft` · `shadow-glow` (orange) · `shadow-bar` (bottom bars) · `shadow-float` (search overlay).
- **Radius:** cards 14–16px, inner tiles 10–12px, CTA pills fully rounded (`rounded-full`), hero 20px.
- **Type:** Poppins; weights 400/500/600/700/800. Mobile sizes are exact from design (e.g. titles 16px bold sections, 21px PDP, 26–27px hero).
- **Icons:** `<Icon name size fill />` (`src/components/ui/Icon.tsx`) renders Material Symbols with FILL variation. Filled = active/brand.
- **Dark mode:** design is light-only; a warm-dark equivalent keeps the toggle working (Profile → Preferences). Default theme = light. White-on-purpose surfaces (trending cards, House of PPD inner cards, yoga promos) stay white in dark mode with fixed dark text.

## 4. Layout System

- **Mobile (design-faithful):** no persistent top header — each screen renders `TopBar` (circle back/menu button + `CartChip`). Fixed bottom stack in `RootLayout`: floating `SearchPill` (routes: `/`, `/products`, `/products/all`) above icon-only `BottomNav` (routes: `/`, `/products`, `/orders`, `/profile`; active tab = gold pill + filled orange icon). Content max-w-md centered.
- **Desktop (our extension):** `DesktopHeader` (logo + nav pills + search pill + wishlist + cart chip), content max-w-6xl, grids widen (products 4–5 cols, cart/PDP 2-col), sticky bottom bars become inline buttons. Bottom stack hidden ≥md.

## 5. Screens (all designed screens implemented)

| Route | Design screen | Notes |
|---|---|---|
| `/` | Home | greeting header, hero carousel+dots, quick categories, Trending (orange block, scroll-synced dots), House of PPD (red block), Monsoon, Recommended (6/page, dot pagination), Yoga Day (+2 promo cards w/ add-to-cart), Build Bundle banner, Shop by Packages |
| `/products` | Category | back+cart, hero banner, category chips (real categories, not the design's book-type chips — functional substitution), Sort By row (`SortInline` w/ hidden select), filter FAB → `/products/all`, 3-col grid, circular pagination (15/page) |
| `/products/all` | All Products | "N Filters Applied", removable chips (category/tag/q) w/ gold cancel icons, filter FAB opens filter Modal (category+sort chips) |
| `/product/:id` | Product | thumb rail + main image, Trending chip, like chip (wishlist w/ count), share, rating \| bought row, price + green Save pill, green delivery banner, bordered description, You May Also Like, sticky Add to Cart (soft) / Buy Now (gradient) bar. Buy Now → cart (per design) |
| `/cart` | Cart | "My Cart" + solid gold cart chip, item cards (heart→wishlist, delete, qty pill), summary card w/ disclaimer, also-like grid, sticky bar: total+Save% left, gradient Proceed to Checkout right. **No coupon input on cart (design)** — coupon still applies via store/checkout |
| `/orders` | Orders | menu+cart, All/Delivered/Undelivered pill tabs, order cards (status pill, ID, expected delivery, View Details), Order Again grid. Public route |
| `/profile` | Profile | ⚠️ heading "Categories to Explore / Everything you need, in one smart kit" is **verbatim from the design** (looks like a design typo — flag to user, 1-line change). Profile card (Student Profile pill, edit, mail/call/school rows), My Orders stat tiles (live counts from store), menu list (Wishlist/Address/Preferences→theme modal/Password/Notifications/Support/About/Log out). Auth-guarded |
| `/search` | Search | route rendered as dim overlay: warm results card (Showing results + View All (N), Popular, live 3-result mini grid, Recent + Clear), real search input pill below (design's OS keyboard mock intentionally NOT implemented — native keyboard) |

**Legacy screens (not in the design, kept functional, inherit tokens):** auth (login/register/forgot), checkout (+success), order details, wishlist, coupons, support, 404. `/categories` redirects → `/products`.

## 6. Components

- `ui/`: Icon, Button (pill; primary=gradient), Input, Badge, Card, Skeleton, Spinner/LoadingView, Rating (RatingBadge inline ★, RatingStars), Price (dark price + struck MRP + Save pill), QuantityStepper (soft-gold − qty +), CircleIconButton (light/solid), Dots (brand/light), Pagination (circles), Modal, EmptyState, Avatar.
- `shared/`: ProductCard (+skeleton; auto badge: brand "PPD" → red **PPD Original**, else green **Save X%**; round orange cart button), ProductBadge/SavePill/StatusPill, CartChip (light/solid), SearchPill, TopBar, SectionHeader (link/pill View All, onColor), BannerCarousel, ProductGrid (3→4→5 cols), PpdLogo, WishlistButton (bare heart).
- `features/home/components/`: QuickCategories, TrendingSection, HouseOfPpdSection, SeasonalSections (TileStrip/Monsoon/Yoga+promos), PackagesSection (+BundleBanner).
- `layout/`: RootLayout, DesktopHeader, BottomNav, AuthLayout.

## 7. State & Data (unchanged architecture)

Zustand stores (persist keys now `ppd:*`): auth (mock login), cart (`getCartTotals` = single pricing source; free ship ≥ ₹499 else ₹40), wishlist, orders (local placeOrder/cancel), address, recently-viewed, ui (theme, default light).
Repository seam `services/repositories/catalog.ts` (mock, 350ms): products (category `'all'` bypasses filter), product, byIds, related, categories, banners, **getHomeContent()** (houseCards/monsoon/yoga/packages from `mocks/home.ts`), reviews (stale — unused by design), coupons/validateCoupon (checkout only). Hooks in `hooks/use-catalog.ts` (+`useHomeContent`).
Catalog: 16 PPD school products in `mocks/products.ts` (Santoor NCERT, notebooks, DOMS pens, geometry boxes, answer sheets, backpack, monsoon & yoga items). `formatCurrency` supports paise (₹3.20). Recent searches in `lib/recent-searches.ts`.

## 8. Conventions

Strict TS, no `any`, `import type`, no enums. Pages = default export (`Page.tsx`), everything else named. Navigate via `ROUTES` map only. Icons via `<Icon>` (Material Symbols) in all designed screens. Tokens only — the design's exact hex values live in globals.css; hardcoded hex in components is allowed ONLY for always-white design cards (trending/house/yoga promo). Toasts via sonner. `npm run build` must pass.

## 9. Pending / Roadmap

- [ ] Migrate legacy screens (auth, checkout, order details, wishlist, coupons, support) from lucide icons → `<Icon>`, and restyle to PPD patterns when designs arrive
- [ ] Confirm with user: Profile heading "Categories to Explore" (design typo?) & bottom-bar total on cart (design shows one item's price ₹140; we show the real total)
- [ ] Real product imagery (currently picsum placeholders; design zip has real photos for reference only)
- [ ] Category chips = real categories (design showed book-type chips: Textbooks/Reference/Story/Workbooks) — revisit when subcategories exist in data
- [ ] Saved Address + Notification Settings pages (profile menu → "coming soon" toasts)
- [ ] Voice search (mic icons are visual), order status auto-progression, reviews UI (data exists)
- [ ] Real backend: set `VITE_API_BASE_URL`, swap repository bodies

## 10. Commands

`npm run dev` · `npm run build` (verification gate) · `npm run lint` (3 known fast-refresh warnings: shared exports in Button/ProductListingPage/OrdersPage — cosmetic)
