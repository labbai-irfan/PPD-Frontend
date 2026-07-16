import { useQuery } from '@tanstack/react-query'
import { recommendationsRepository } from '@/services/repositories/recommendations'

export const recommendationKeys = {
  trending: (limit: number) => ['recommendations', 'trending', limit] as const,
  personalized: (limit: number) => ['recommendations', 'personalized', limit] as const,
  smart: (limit: number) => ['recommendations', 'smart', limit] as const,
  byCategory: (category: string, excludeId?: string, limit?: number) =>
    ['recommendations', 'by-category', category, excludeId, limit] as const,
  stats: ['recommendations', 'stats'] as const,
}

/**
 * Get trending recommendations (by sales quantity).
 * Works for all users (no auth required).
 */
export function useTrendingRecommendations(limit = 10) {
  return useQuery({
    queryKey: recommendationKeys.trending(limit),
    queryFn: () => recommendationsRepository.getTrendingRecommendations(limit),
  })
}

/**
 * Get personalized recommendations for the current user.
 * If user has no purchase history, returns trending products.
 * If user has purchase history, returns top products from their favorite categories.
 * Requires authentication.
 */
export function usePersonalizedRecommendations(limit = 10, enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.personalized(limit),
    queryFn: () => recommendationsRepository.getPersonalizedRecommendations(limit),
    enabled,
  })
}

/**
 * Smart recommendation endpoint that auto-selects strategy.
 * - For authenticated users with purchase history: personalized recommendations
 * - Otherwise: trending products
 * Works with or without authentication.
 */
export function useSmartRecommendations(limit = 10) {
  return useQuery({
    queryKey: recommendationKeys.smart(limit),
    queryFn: () => recommendationsRepository.getSmartRecommendations(limit),
  })
}

/**
 * Get recommendations for a specific category.
 */
export function useRecommendationsByCategory(
  category: string,
  excludeProductId?: string,
  limit = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: recommendationKeys.byCategory(category, excludeProductId, limit),
    queryFn: () => recommendationsRepository.getRecommendationsByCategory(category, excludeProductId, limit),
    enabled: enabled && Boolean(category),
  })
}

/**
 * Get recommendation statistics for the current user.
 * Shows purchase history status and favorite categories.
 * Requires authentication.
 */
export function useRecommendationStats(enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.stats,
    queryFn: () => recommendationsRepository.getRecommendationStats(),
    enabled,
  })
}
