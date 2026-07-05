import { banners, categories } from '@/mocks/categories'
import { products } from '@/mocks/products'
import { coupons, reviews } from '@/mocks/reviews'
import { houseCards, monsoonTiles, packages, yogaPromos, yogaTiles } from '@/mocks/home'
import { sleep } from '@/lib/utils'
import type { Banner, Category, Coupon, Paginated, Product, ProductQuery, Review } from '@/types'

/**
 * Catalog repository — the single data-access seam for the whole app.
 * Currently backed by in-memory mocks with simulated latency; replace each
 * method body with an `apiClient` call when the backend exists.
 */

const LATENCY = 350

function applyQuery(query: ProductQuery): Product[] {
  let result = [...products]

  if (query.category && query.category !== 'all') result = result.filter((p) => p.category === query.category)
  if (query.tag) result = result.filter((p) => p.tags.includes(query.tag!))
  if (query.brands?.length) result = result.filter((p) => query.brands!.includes(p.brand))
  if (query.minPrice != null) result = result.filter((p) => p.price >= query.minPrice!)
  if (query.maxPrice != null) result = result.filter((p) => p.price <= query.maxPrice!)
  if (query.minRating != null) result = result.filter((p) => p.rating >= query.minRating!)

  if (query.q) {
    const q = query.q.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }

  switch (query.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'discount':
      result.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
      break
    case 'newest':
      result.sort((a, b) => Number(b.tags.includes('new')) - Number(a.tags.includes('new')))
      break
    default:
      break
  }

  return result
}

export const catalogRepository = {
  async listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    await sleep(LATENCY)
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 12
    const filtered = applyQuery(query)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return { items, total: filtered.length, page, pageSize, hasMore: start + items.length < filtered.length }
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    await sleep(LATENCY)
    const product = products.find((p) => p.id === idOrSlug || p.slug === idOrSlug)
    if (!product) throw new Error('Product not found')
    return product
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    await sleep(150)
    return products.filter((p) => ids.includes(p.id))
  },

  async getRelated(productId: string, limit = 8): Promise<Product[]> {
    await sleep(LATENCY)
    const source = products.find((p) => p.id === productId)
    if (!source) return []
    return products
      .filter((p) => p.id !== productId)
      .sort((a, b) => Number(b.category === source.category) - Number(a.category === source.category))
      .slice(0, limit)
  },

  async getCategories(): Promise<Category[]> {
    await sleep(200)
    return categories
  },

  async getBanners(): Promise<Banner[]> {
    await sleep(200)
    return banners
  },

  /** Static content blocks for the designed home sections. */
  async getHomeContent() {
    await sleep(200)
    return { houseCards, monsoonTiles, yogaTiles, yogaPromos, packages }
  },

  async getReviews(productId: string): Promise<Review[]> {
    await sleep(LATENCY)
    return reviews.filter((r) => r.productId === productId)
  },

  async getCoupons(): Promise<Coupon[]> {
    await sleep(200)
    return coupons
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discount: number }> {
    await sleep(300)
    const coupon = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
    if (!coupon) throw new Error('Invalid coupon code')
    if (subtotal < coupon.minOrder) throw new Error(`Add items worth ₹${coupon.minOrder - subtotal} more to use this coupon`)
    const raw = coupon.kind === 'flat' ? coupon.value : (subtotal * coupon.value) / 100
    const discount = Math.round(coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw)
    return { coupon, discount }
  },
}
