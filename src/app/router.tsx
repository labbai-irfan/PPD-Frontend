import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from '@/components/layout/RootLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import RequireAuth from '@/app/RequireAuth'
import { ROUTES } from '@/lib/constants'

/** Route-level code splitting: each page loads on demand. */
const lazyPage = (importer: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await importer()).default,
})

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', lazy: lazyPage(() => import('@/features/home/HomePage')) },
      { path: '/products', lazy: lazyPage(() => import('@/features/products/ProductListingPage')) },
      { path: '/products/all', lazy: lazyPage(() => import('@/features/products/AllProductsPage')) },
      { path: '/product/:id', lazy: lazyPage(() => import('@/features/products/ProductDetailsPage')) },
      /* Legacy path — the categories tab is the products listing in the design */
      { path: '/categories', element: <Navigate to={ROUTES.products} replace /> },
      { path: '/search', lazy: lazyPage(() => import('@/features/search/SearchPage')) },
      { path: '/cart', lazy: lazyPage(() => import('@/features/cart/CartPage')) },
      { path: '/wishlist', lazy: lazyPage(() => import('@/features/wishlist/WishlistPage')) },
      { path: '/coupons', lazy: lazyPage(() => import('@/features/coupons/CouponsPage')) },
      { path: '/support', lazy: lazyPage(() => import('@/features/support/SupportPage')) },
      { path: '/orders', lazy: lazyPage(() => import('@/features/orders/OrdersPage')) },
      { path: '/orders/:id', lazy: lazyPage(() => import('@/features/orders/OrderDetailsPage')) },
      {
        element: <RequireAuth />,
        children: [
          { path: '/checkout', lazy: lazyPage(() => import('@/features/checkout/CheckoutPage')) },
          { path: '/checkout/success/:orderId', lazy: lazyPage(() => import('@/features/checkout/OrderSuccessPage')) },
          { path: '/profile', lazy: lazyPage(() => import('@/features/profile/ProfilePage')) },
        ],
      },
      { path: '*', lazy: lazyPage(() => import('@/features/misc/NotFoundPage')) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/auth/login', lazy: lazyPage(() => import('@/features/auth/LoginPage')) },
      { path: '/auth/register', lazy: lazyPage(() => import('@/features/auth/RegisterPage')) },
      { path: '/auth/forgot-password', lazy: lazyPage(() => import('@/features/auth/ForgotPasswordPage')) },
    ],
  },
])
