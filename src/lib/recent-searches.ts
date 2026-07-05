import { STORAGE_KEYS } from '@/lib/constants'

/** Best-effort recent-search history in localStorage. */

export function saveRecentSearch(query: string) {
  try {
    const next = [query, ...getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase())].slice(0, 8)
    localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(next))
  } catch {
    // storage unavailable — history is optional
  }
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentSearches)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEYS.recentSearches)
  } catch {
    // ignore
  }
}
