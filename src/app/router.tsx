import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from '@/components/layout/RootLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import AdminLayout from '@/components/admin/AdminLayout'
import RequireAuth from '@/app/RequireAuth'
import AdminGuard from '@/app/AdminGuard'
import { ROUTES } from '@/lib/constants'

/** Route-level code splitting: each page loads on demand. */
const lazyPage = (importer: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await importer()).default,
})

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: () => null,
    children: [
      { path: '/', lazy: lazyPage(() => import('@/features/home/HomePage')) },
      { path: '/products', lazy: lazyPage(() => import('@/features/products/ProductListingPage')) },
      { path: '/products/all', lazy: lazyPage(() => import('@/features/products/AllProductsPage')) },
      { path: '/product/:idOrSlug', lazy: lazyPage(() => import('@/features/products/ProductDetailsPage')) },
      /* Legacy path — the categories tab is the products listing in the design */
      { path: '/categories', element: <Navigate to={ROUTES.products} replace /> },
      { path: '/search', lazy: lazyPage(() => import('@/features/search/SearchPage')) },
      { path: '/cart', lazy: lazyPage(() => import('@/features/cart/CartPage')) },
      { path: '/wishlist', lazy: lazyPage(() => import('@/features/wishlist/WishlistPage')) },
      { path: '/coupons', lazy: lazyPage(() => import('@/features/coupons/CouponsPage')) },
      { path: '/support', lazy: lazyPage(() => import('@/features/support/SupportPage')) },

      /* Products - Advanced */
      { path: '/compare', lazy: lazyPage(() => import('@/features/products/CompareProductsPage')) },

      /* Bulk & Special */
      { path: '/bulk-order', lazy: lazyPage(() => import('@/features/bulk/BulkOrderPage')) },
      { path: '/gift-cards', lazy: lazyPage(() => import('@/features/giftcards/GiftCardsPage')) },

      /* Support & Contact */
      { path: '/contact-us', lazy: lazyPage(() => import('@/features/support/ContactUsPage')) },

      /* Info Pages */
      { path: '/help', lazy: lazyPage(() => import('@/features/info/HelpPage')) },
      { path: '/terms', lazy: lazyPage(() => import('@/features/info/TermsPage')) },
      { path: '/privacy', lazy: lazyPage(() => import('@/features/info/PrivacyPage')) },
      { path: '/about', lazy: lazyPage(() => import('@/features/info/AboutPage')) },

      {
        element: <RequireAuth />,
        children: [
          { path: '/checkout', lazy: lazyPage(() => import('@/features/checkout/CheckoutPage')) },
          /* Provider-aware: Razorpay hosted checkout or the mock instrument forms */
          { path: '/checkout/payment/:method', lazy: lazyPage(() => import('@/features/checkout/payment/PaymentMethodPage')) },
          { path: '/checkout/success/:orderId', lazy: lazyPage(() => import('@/features/checkout/OrderSuccessPage')) },
          { path: '/profile', lazy: lazyPage(() => import('@/features/profile/ProfilePage')) },
          
          /* Orders & Tracking */
          { path: '/orders', lazy: lazyPage(() => import('@/features/orders/OrdersPage')) },
          { path: '/orders/:id', lazy: lazyPage(() => import('@/features/orders/OrderDetailsPage')) },
          { path: '/track/:id', lazy: lazyPage(() => import('@/features/orders/TrackOrderPage')) },

          /* Address Management */
          { path: '/addresses', lazy: lazyPage(() => import('@/features/address/AddressesPage')) },
          { path: '/address/add', lazy: lazyPage(() => import('@/features/address/AddAddressPage')) },
          { path: '/address/:id/edit', lazy: lazyPage(() => import('@/features/address/AddAddressPage')) },

          /* Payment & Account */
          { path: '/payment-methods', lazy: lazyPage(() => import('@/features/payment/PaymentMethodsPage')) },
          { path: '/account-settings', lazy: lazyPage(() => import('@/features/profile/AccountSettingsPage')) },
          { path: '/notifications', lazy: lazyPage(() => import('@/features/notifications/NotificationsPage')) },

          /* Returns & RMA */
          { path: '/returns', lazy: lazyPage(() => import('@/features/returns/ReturnsPage')) },

          /* Reviews & Ratings */
          { path: '/my-reviews', lazy: lazyPage(() => import('@/features/reviews/MyReviewsPage')) },
          { path: '/review/:productId', lazy: lazyPage(() => import('@/features/reviews/ReviewProductPage')) },

          /* Referral & Rewards */
          { path: '/referral', lazy: lazyPage(() => import('@/features/referral/ReferralPage')) },
          { path: '/rewards', lazy: lazyPage(() => import('@/features/rewards/RewardsPage')) },
        ],
      },
      { path: '*', lazy: lazyPage(() => import('@/features/misc/NotFoundPage')) },
    ],
  },
  {
    element: <AuthLayout />,
    HydrateFallback: () => null,
    children: [
      { path: '/auth/login', lazy: lazyPage(() => import('@/features/auth/LoginPage')) },
      { path: '/auth/register', lazy: lazyPage(() => import('@/features/auth/RegisterPage')) },
      { path: '/auth/forgot-password', lazy: lazyPage(() => import('@/features/auth/ForgotPasswordPage')) },
      { path: '/auth/phone-verify', lazy: lazyPage(() => import('@/features/auth/PhoneVerificationPage')) },
      { path: '/auth/otp-verify', lazy: lazyPage(() => import('@/features/auth/OtpVerificationPage')) },
      { path: '/auth/reset-password', lazy: lazyPage(() => import('@/features/auth/ResetPasswordPage')) },
      { path: '/admin', lazy: lazyPage(() => import('@/features/admin/AdminLoginPage')) },
      { path: '/admin/forgot-password', lazy: lazyPage(() => import('@/features/admin/AdminForgotPasswordPage')) },
    ],
  },
  {
    element: <AdminGuard />,
    HydrateFallback: () => null,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', lazy: lazyPage(() => import('@/features/admin/AdminDashboardPage')) },
          { path: '/admin/products', lazy: lazyPage(() => import('@/features/admin/AdminProductsPage')) },
          { path: '/admin/products/add', lazy: lazyPage(() => import('@/features/admin/AddProductPage')) },
          { path: '/admin/products/:id/edit', lazy: lazyPage(() => import('@/features/admin/AddProductPage')) },
          { path: '/admin/orders', lazy: lazyPage(() => import('@/features/admin/AdminOrdersPage')) },
          { path: '/admin/users', lazy: lazyPage(() => import('@/features/admin/AdminUsersPage')) },
          { path: '/admin/reviews', lazy: lazyPage(() => import('@/features/admin/AdminReviewsPage')) },
          { path: '/admin/coupons', lazy: lazyPage(() => import('@/features/admin/AdminCouponsPage')) },
          { path: '/admin/categories', lazy: lazyPage(() => import('@/features/admin/AdminCategoriesPage')) },
          { path: '/admin/banners', lazy: lazyPage(() => import('@/features/admin/AdminBannersPage')) },
          { path: '/admin/admins', lazy: lazyPage(() => import('@/features/admin/AdminsPage')) },
          { path: '/admin/settings', lazy: lazyPage(() => import('@/features/admin/SettingsPage')) },
          { path: '/admin/security', lazy: lazyPage(() => import('@/features/admin/AdminSecurityPage')) },
          { path: '/admin/bulk-import', lazy: lazyPage(() => import('@/features/admin/AdminBulkImportPage')) },
        ],
      },
    ],
  },
])
