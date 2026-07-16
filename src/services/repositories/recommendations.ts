import { apiClient } from '@/services/api/client'
import type { Product } from '@/types'

export interface RecommendationStats {
  hasPurchaseHistory: boolean
  favoriteCategories: string[]
  totalOrdersCount: number
}

export const recommendationsRepository = {
  /**
   * Get trending recommendations (by sales quantity).
   * Works for all users (no auth required).
   */
  async getTrendingRecommendations(limit = 10): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/recommendations/trending', {
      params: { limit },
    })
    return data
  },

  /**
   * Get personalized recommendations for the current user.
   * If user has no purchase history, returns trending products.
   * If user has purchase history, returns top products from their favorite categories.
   * Requires authentication.
   */
  async getPersonalizedRecommendations(limit = 10): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/recommendations/for-me', {
      params: { limit },
    })
    return data
  },

  /**
   * Smart recommendation endpoint that auto-selects strategy.
   * - For authenticated users with purchase history: personalized recommendations
   * - Otherwise: trending products
   * Works with or without authentication.
   */
  async getSmartRecommendations(limit = 10): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/recommendations', {
      params: { limit },
    })
    return data
  },

  /**
   * Get recommendations for a specific category.
   */
  async getRecommendationsByCategory(
    category: string,
    excludeProductId?: string,
    limit = 10,
  ): Promise<Product[]> {
    const params: Record<string, string | number> = { limit }
    if (excludeProductId) {
      params.exclude = excludeProductId
    }

    const { data } = await apiClient.get<Product[]>(`/recommendations/by-category/${category}`, {
      params,
    })
    return data
  },

  /**
   * Get recommendation statistics for the current user.
   * Shows purchase history status and favorite categories.
   * Requires authentication.
   */
  async getRecommendationStats(): Promise<RecommendationStats> {
    const { data } = await apiClient.get<RecommendationStats>('/recommendations/stats')
    return data
  },
}
