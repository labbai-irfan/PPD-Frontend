import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { catalogRepository } from '@/services/repositories/catalog'
import type { ProductQuery } from '@/types'

export const catalogKeys = {
  products: (query: ProductQuery) => ['products', query] as const,
  product: (id: string) => ['product', id] as const,
  productsByIds: (ids: string[]) => ['products-by-ids', ids] as const,
  related: (id: string) => ['related', id] as const,
  categories: ['categories'] as const,
  banners: ['banners'] as const,
  homeContent: ['home-content'] as const,
  reviews: (productId: string) => ['reviews', productId] as const,
  coupons: ['coupons'] as const,
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: catalogKeys.products(query),
    queryFn: () => catalogRepository.listProducts(query),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => catalogRepository.getProduct(id),
    enabled: Boolean(id),
  })
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: catalogKeys.productsByIds(ids),
    queryFn: () => catalogRepository.getProductsByIds(ids),
    enabled: ids.length > 0,
  })
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: catalogKeys.related(productId),
    queryFn: () => catalogRepository.getRelated(productId),
    enabled: Boolean(productId),
  })
}

export function useCategories() {
  return useQuery({ queryKey: catalogKeys.categories, queryFn: catalogRepository.getCategories })
}

export function useBanners() {
  return useQuery({ queryKey: catalogKeys.banners, queryFn: catalogRepository.getBanners })
}

export function useHomeContent() {
  return useQuery({ queryKey: catalogKeys.homeContent, queryFn: catalogRepository.getHomeContent })
}

export function useReviews(productId: string) {
  return useQuery({
    queryKey: catalogKeys.reviews(productId),
    queryFn: () => catalogRepository.getReviews(productId),
    enabled: Boolean(productId),
  })
}

export function useCoupons() {
  return useQuery({ queryKey: catalogKeys.coupons, queryFn: catalogRepository.getCoupons })
}
