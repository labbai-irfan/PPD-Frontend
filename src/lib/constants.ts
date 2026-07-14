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

  /* Auth */
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  phoneVerify: '/auth/phone-verify',
  otpVerification: '/auth/otp-verify',
  resetPassword: '/auth/reset-password',

  /* Shopping */
  products: '/products',
  allProducts: '/products/all',
  product: (id: string) => `/product/${id}`,
  category: (slug: string) => `/products/all?category=${slug}`,
  categories: '/products',
  search: '/search',
  cart: '/cart',
  wishlist: '/wishlist',

  /* Checkout & Orders */
  checkout: '/checkout',
  checkoutPayment: (method: 'card' | 'upi' | 'netbanking') => `/checkout/payment/${method}`,
  checkoutSuccess: (orderId: string) => `/checkout/success/${orderId}`,
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,

  /* Account & Profile */
  profile: '/profile',
  addresses: '/addresses',
  addAddress: '/address/add',
  editAddress: (id: string) => `/address/${id}/edit`,
  accountSettings: '/account-settings',
  paymentMethods: '/payment-methods',

  /* Notifications & Support */
  notifications: '/notifications',
  coupons: '/coupons',
  support: '/support',
  returns: '/returns',

  /* Reviews & Ratings */
  myReviews: '/my-reviews',
  reviewProduct: (productId: string) => `/review/${productId}`,
  compare: '/compare',

  /* Order Tracking */
  trackOrder: (orderId: string) => `/track/${orderId}`,

  /* Referral & Rewards */
  referral: '/referral',
  rewards: '/rewards',

  /* Bulk & Special */
  bulkOrder: '/bulk-order',
  giftCards: '/gift-cards',

  /* Contact */
  contactUs: '/contact-us',

  /* Info Pages */
  help: '/help',
  terms: '/terms',
  privacy: '/privacy',
  about: '/about',

  /* Admin Routes */
  adminLogin: '/admin',
  adminForgotPassword: '/admin/forgot-password',
  adminDashboard: '/admin/dashboard',
  adminProducts: '/admin/products',
  addProduct: '/admin/products/add',
  editProduct: (id: string) => `/admin/products/${id}/edit`,
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
  adminReviews: '/admin/reviews',
  adminCoupons: '/admin/coupons',
  addCoupon: '/admin/coupons/add',
  adminCategories: '/admin/categories',
  adminAdmins: '/admin/admins',
  adminSettings: '/admin/settings',
  adminSecurity: '/admin/security',
} as const
