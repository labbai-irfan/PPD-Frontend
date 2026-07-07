import { ROUTES } from '@/lib/constants'

/** Content blocks for the designed home screen sections. */

export interface HouseCard {
  title: string
  image: string
  href: string
}

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

export interface PackageCard {
  name: string
  blurb: string
  price: number
  image: string
  href: string
}

const img = (seed: string, w = 300, h = 300) => `https://picsum.photos/seed/${seed}/${w}/${h}`

/** "From the House of PPD" red block cards. */
export const houseCards: HouseCard[] = [
  { title: 'School Books', image: img('ppd-school-books', 160, 200), href: ROUTES.category('books') },
  { title: 'General Knowledge', image: img('ppd-gk', 160, 200), href: ROUTES.category('books') },
  { title: 'Yoga', image: img('ppd-yoga-book', 160, 200), href: ROUTES.category('books') },
  { title: 'Cyber World', image: img('ppd-cyber', 160, 200), href: ROUTES.category('books') },
]

/** "Monsoon Essentials" tiles. */
export const monsoonTiles: CategoryTile[] = [
  { label: 'Umbrella', image: '/images/image%2010.png', href: ROUTES.product('p12') },
  { label: 'Raincoats', image: '/images/image%2011.png', href: ROUTES.product('p13') },
  { label: 'Bag covers', image: '/images/image%2012.png', href: ROUTES.category('for-kids') },
  { label: 'Bottles', image: '/images/image%2013.png', href: ROUTES.product('p16') },
]

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

/** "Shop by Packages" cards. */
export const packages: PackageCard[] = [
  { name: 'Complete Writing Kit', blurb: 'Perfect for a fresh start to the year', price: 311, image: '/images/packages/writing-kit.png', href: ROUTES.category('stationery') },
  { name: 'Art Kits', blurb: 'Perfect for a fresh start to the year', price: 311, image: '/images/packages/art-kit.png', href: ROUTES.category('stationery') },
  { name: 'Craft Kits', blurb: 'Perfect for a fresh start to the year', price: 311, image: '/images/packages/craft-kit.png', href: ROUTES.category('stationery') },
  { name: 'Exam Kits', blurb: 'Perfect for a fresh start to the year', price: 311, image: '/images/packages/exam-kit.png', href: ROUTES.category('stationery') },
]

/** Category screen filter chips + All Products applied chips (from the design). */
export const categoryChips = ['Textbooks', 'Reference Books', 'Story Books', 'Workbooks']
export const popularSearches = ['Doms Geometry Box', 'Camlin Box', 'Geometry Box']
