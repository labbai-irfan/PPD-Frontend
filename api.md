# api.md — PPD Store Data Layer

The app runs on a **mock repository** today; screens are already wired so that
swapping to a real backend needs **zero screen/store changes**.

## Seam

`src/services/repositories/catalog.ts` is the single data-access module. It
currently returns seed data (`src/mocks/*`) with ~350ms simulated latency.
`src/services/api/client.ts` is a configured Axios instance (base URL from
`VITE_API_BASE_URL`, bearer-token request interceptor from the auth store,
error-normalizing response interceptor) ready for real calls.

## React Query hooks (`hooks/use-catalog.ts`)

| Hook | Repository method | Returns |
|---|---|---|
| `useProducts(query)` | `listProducts` | `Paginated<Product>` |
| `useProduct(id)` | `getProduct` | `Product` |
| `useProductsByIds(ids)` | `getProductsByIds` | `Product[]` |
| `useRelatedProducts(id)` | `getRelated` | `Product[]` |
| `useCategories()` | `getCategories` | `Category[]` |
| `useBanners()` | `getBanners` | `Banner[]` |
| `useHomeContent()` | `getHomeContent` | house/monsoon/yoga/packages blocks |
| `useReviews(productId)` | `getReviews` | `Review[]` |
| `useCoupons()` | `getCoupons` | `Coupon[]` |

Query keys are centralized in `catalogKeys`. Defaults (in `AppProviders`):
`staleTime` 60s, `gcTime` 5m, `retry` 1, no refetch-on-focus.

## `ProductQuery` (listing/search contract)

`{ category?, q?, sort?, minPrice?, maxPrice?, minRating?, brands?, tag?, page?,
pageSize? }` → `Paginated<T> = { items, total, page, pageSize, hasMore }`.
`sort ∈ relevance | price-asc | price-desc | rating | newest | discount`.
Category `'all'` bypasses the category filter.

## Mutations (client stores, mock)

`validateCoupon(code, subtotal)` (repository) · `cart.store` add/remove/qty/coupon
· `orders.store.placeOrder/cancelOrder` · `auth.store.login/register` · address /
wishlist / recently-viewed stores. All persist to `localStorage` under `ppd:*`.

## Going live

1. Set `VITE_API_BASE_URL`.
2. Replace each `catalogRepository` method body with an `apiClient` call
   returning the same typed shape (`src/types`).
3. Convert the relevant store mutations to server calls + React Query
   invalidation. Hooks, screens and query keys stay the same.

Domain models: `src/types/index.ts` (Product, Category, Banner, Review, Coupon,
User, Address, CartItem, Order, AppNotification, ProductQuery, Paginated).
