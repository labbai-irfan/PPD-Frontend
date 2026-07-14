import { reviews } from '@/mocks/reviews'
import { sleep } from '@/lib/utils'
import { apiClient } from '@/services/api/client'
import type { Banner, Category, Coupon, Paginated, Product, ProductQuery, Review } from '@/types'

/**
 * Catalog repository — the single data-access seam for the whole app.
 * Products/categories/banners/home are LIVE against the backend API.
 * Coupons and product reviews stay mocked until their backend phases land.
 */

export const catalogRepository = {
  async listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const params: Record<string, string | number> = {}
    if (query.category) params.category = query.category
    if (query.q) params.q = query.q
    if (query.sort) params.sort = query.sort
    if (query.minPrice != null) params.minPrice = query.minPrice
    if (query.maxPrice != null) params.maxPrice = query.maxPrice
    if (query.minRating != null) params.minRating = query.minRating
    if (query.brands?.length) params.brands = query.brands.join(',')
    if (query.tag) params.tag = query.tag
    params.page = query.page ?? 1
    params.pageSize = query.pageSize ?? 12

    const { data } = await apiClient.get<Paginated<Product>>('/products', { params })
    return data
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${idOrSlug}`)
    return data
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return []
    const { data } = await apiClient.post<Product[]>('/products/by-ids', { ids })
    return data
  },

  async getRelated(productId: string, _limit = 8): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(`/products/${productId}/related`)
    return data
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },

  async getBanners(): Promise<Banner[]> {
    const { data } = await apiClient.get<Banner[]>('/banners')
    return data
  },

  /** Home page content sections (backend singleton). */
  async getHomeContent() {
    const { data } = await apiClient.get('/home')
    return data as {
      houseCards: { title: string; image: string; href: string }[]
      yogaTiles: { label: string; image: string; href: string }[]
      yogaPromos: { name: string; desc: string; price: number; image: string; productId: string }[]
      packages: { name: string; blurb: string; price: number; image: string; href: string }[]
    }
  },

  /** Mock until reviews backend lands (Phase 5). */
  async getReviews(productId: string): Promise<Review[]> {
    await sleep(200)
    return reviews.filter((r) => r.productId === productId)
  },

  async getCoupons(): Promise<Coupon[]> {
    const { data } = await apiClient.get<Coupon[]>('/coupons')
    return data
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discount: number }> {
    const { data } = await apiClient.post<{ coupon: Coupon; discount: number }>('/coupons/validate', {
      code,
      subtotal,
    })
    return data
  },
}
