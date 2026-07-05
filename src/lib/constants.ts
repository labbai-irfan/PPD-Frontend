export const APP_NAME = 'PPD'
export const APP_TAGLINE = 'Everything for School'
export const BRAND_LINE = "India's Trusted Educational Publisher since 1926"

/** Change these two lines to re-localize pricing app-wide. */
export const CURRENCY = 'INR'
export const LOCALE = 'en-IN'

export const FREE_SHIPPING_THRESHOLD = 499
export const SHIPPING_FEE = 40

export const STORAGE_KEYS = {
  theme: 'ppd:theme',
  auth: 'ppd:auth',
  cart: 'ppd:cart',
  wishlist: 'ppd:wishlist',
  orders: 'ppd:orders',
  recentlyViewed: 'ppd:recently-viewed',
  recentSearches: 'ppd:recent-searches',
  addresses: 'ppd:addresses',
} as const

/**
 * Central route map. Every navigation in the app goes through these
 * builders so screens stay connected when paths evolve.
 */
export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  /** Category screen from the design (banner + chips + grid) */
  products: '/products',
  /** "All Products" screen from the design (applied filters + grid) */
  allProducts: '/products/all',
  product: (id: string) => `/product/${id}`,
  category: (slug: string) => `/products?category=${slug}`,
  categories: '/products',
  search: '/search',
  cart: '/cart',
  wishlist: '/wishlist',
  checkout: '/checkout',
  checkoutSuccess: (orderId: string) => `/checkout/success/${orderId}`,
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  profile: '/profile',
  addresses: '/profile/addresses',
  settings: '/profile/settings',
  notifications: '/notifications',
  coupons: '/coupons',
  support: '/support',
} as const
