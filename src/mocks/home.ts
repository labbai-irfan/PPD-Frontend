import { ROUTES } from '@/lib/constants'

/** Content blocks for the designed home screen sections. */

export interface CategoryTile {
  label: string
  image: string
  href: string
}

export interface PromoCard {
  name: string
  desc: string
  price: number
  image: string
  productId: string
}

export const yogaTiles: CategoryTile[] = [
  { label: 'Mats', image: '/images/image%2023.png', href: ROUTES.product('p14') },
  { label: 'Headbands', image: '/images/image%2024.png', href: ROUTES.category('for-kids') },
  { label: 'Towels', image: '/images/image%2026.png', href: ROUTES.product('p15') },
  { label: 'Bottles', image: '/images/image%2025.png', href: ROUTES.product('p16') },
]

export const yogaPromos: PromoCard[] = [
  {
    name: 'Yoga Mat',
    desc: 'Comfortable mats for yoga, stretching and daily fitness.',
    price: 99,
    image: '/images/image1.png',
    productId: 'p14',
  },
  {
    name: 'Towels',
    desc: 'Soft, absorbent towels to keep you fresh during every session.',
    price: 49,
    image: '/images/image_towel.png',
    productId: 'p15',
  },
]

/** Category screen filter chips + All Products applied chips (from the design). */
export const categoryChips = ['Textbooks', 'Reference Books', 'Story Books', 'Workbooks']
export const popularSearches = ['Doms Geometry Box', 'Camlin Box', 'Geometry Box']
