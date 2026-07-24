/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string
  slug: string
  name: string
  /** Material Symbols icon name (design renders categories as icon tiles) */
  icon: string
  /** Short blurb shown on category cards */
  description?: string
  /** brand accent for the icon, from the design */
  color: string
  image?: string
  productCount: number
  /** Parent category id — null/undefined for a top-level category, set for a subcategory */
  parentId?: string | null
}

export interface Brand {
  id: string
  name: string
  logo?: string
}

export interface ProductVariantOption {
  /** e.g. "size" | "color" */
  type: string
  label: string
  values: VariantValue[]
}

export interface VariantValue {
  value: string
  label: string
  /** hex/oklch swatch for color variants */
  swatch?: string
  inStock: boolean
}

export interface ProductFaq {
  question: string
  answer: string
}

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductBatch {
  _id?: string
  sku: string
  name: string
  quantity: number
  calculatedPrice: number
  discountType: 'none' | 'percentage' | 'fixed'
  discountValue: number
  sellingPrice: number
  pricingMode: 'auto' | 'custom'
  displayOrder: number
  status: 'active' | 'inactive' | 'hidden'
  isDefault: boolean
  image?: string
  description?: string
  badge: 'none' | 'popular' | 'best-seller' | 'recommended' | 'most-value' | 'limited-offer'
  minOrderCount: number
  maxOrderCount: number
}

export interface Product {
  id: string
  slug: string
  title: string
  brand: string
  category: string
  description: string
  shortDescription?: string
  highlights: string[]
  images: string[]
  price: number
  unitPrice?: number
  mrp: number
  rating: number
  ratingCount: number
  reviewCount: number
  stock: number
  stockQuantity?: number
  variants: ProductVariantOption[]
  tags: ProductTag[]
  /** social proof label from the design, e.g. "1.5K+ bought" */
  bought?: string
  deliveryDays: number
  returnDays: number
  isPpdOriginal?: boolean
  isFreeDelivery?: boolean
  freeDeliveryThreshold?: number
  sku?: string
  hsnCode?: string
  faqs?: ProductFaq[]
  specs?: ProductSpec[]
  batches?: ProductBatch[]
  weightPerUnit?: number
  weightUnit?: 'kg' | 'g'
  discountPercent?: number
  gstPercent?: number
  status?: 'draft' | 'published'
}

export type ProductTag = 'featured' | 'deal' | 'new' | 'bestseller' | 'trending'

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount'

export interface ProductQuery {
  category?: string
  q?: string
  sort?: SortOption
  minPrice?: number
  maxPrice?: number
  minRating?: number
  brands?: string[]
  tag?: ProductTag
  ppdOriginal?: boolean
  page?: number
  pageSize?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface Review {
  id: string
  productId: string
  author: string
  avatar?: string
  rating: number
  title: string
  body: string
  createdAt: string
  helpfulCount: number
  verifiedPurchase: boolean
  images?: string[]
}

export interface PackageItem {
  productId: string
  slug: string
  title: string
  brand: string
  image: string
  price: number
  mrp: number
  stock: number
  isActive: boolean
  quantity: number
}

export interface Package {
  id: string
  slug: string
  name: string
  description: string
  image: string
  isActive: boolean
  sortOrder: number
  itemCount: number
  /** Bundle price — admin override, or the sum of item prices when unset */
  price: number
  /** Sum of item MRPs, for a strikethrough comparison */
  originalTotal: number
  savings: number
  items: PackageItem[]
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  cta: string
  href: string
  image: string
  /** tailwind gradient classes for the banner backdrop */
  tone: string
  /** where the banner renders: 'hero' = home top carousel; 'bundle' = Build-Your-Bundle band */
  placement?: 'hero' | 'bundle'
}

/* ------------------------------------------------------------------ */
/* User & auth                                                         */
/* ------------------------------------------------------------------ */

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
  accountType: 'student' | 'parent'
  grade?: string
}

export interface Address {
  id: string
  name: string
  phone: string
  country: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  type?: 'home' | 'work' | 'other'
  isDefault?: boolean
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet'
  brand?: string
  last4?: string
  expiry?: string
  isDefault?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'order' | 'promo' | 'info'
}

export interface ReturnRequest {
  id: string
  orderId: string
  productName: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestDate: Date
  refundAmount: number
}

/* ------------------------------------------------------------------ */
/* Cart & orders                                                       */
/* ------------------------------------------------------------------ */

export interface CartItem {
  /** `${productId}` or `${productId}:${variantKey}` */
  key: string
  productId: string
  title: string
  brand: string
  image: string
  price: number
  mrp: number
  quantity: number
  stock: number
  /** selected variant values, e.g. { size: "M", color: "Black" } */
  selections: Record<string, string>
  batchId?: string
  batchSku?: string
  batchName?: string
  unitPrice?: number
  batchQuantity?: number
  batchPrice?: number
  batchCount?: number
  totalUnits?: number
  totalAmount?: number
  pricingMode?: string
}

export interface Coupon {
  code: string
  title: string
  description: string
  /** flat amount or percent */
  kind: 'flat' | 'percent'
  value: number
  minOrder: number
  maxDiscount?: number
  expiresAt: string
}

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled'

export type PaymentMethodKind = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  items: CartItem[]
  status: OrderStatus
  createdAt: string
  address: Address
  payment: { method: PaymentMethodKind; label: string; status?: PaymentStatus; transactionId?: string }
  pricing: {
    subtotal: number
    discount: number
    couponCode?: string
    shipping: number
    total: number
  }
}

export interface AppNotification {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  kind: 'order' | 'offer' | 'system'
  href?: string
}
