import type { Banner, Category } from '@/types'
import { ROUTES } from '@/lib/constants'
import { categoryColors } from '@/theme/colors'

/** Quick categories from the design home screen (icon + brand accent from tokens). */
export const categories: Category[] = [
  { id: 'c1', slug: 'all', name: 'All', icon: 'apps', color: categoryColors.all, image: '/icons/menu.svg', productCount: 0 },
  { id: 'c2', slug: 'books', name: 'Books', icon: 'menu_book', color: categoryColors.books, image: '/images/image%2017.png', productCount: 420 },
  { id: 'c3', slug: 'stationery', name: 'Stationery', icon: 'edit', color: categoryColors.stationery, image: '/images/image%2018.png', productCount: 380 },
  { id: 'c4', slug: 'bags', name: 'Bags', icon: 'backpack', color: categoryColors.bags, image: '/images/image%2019.png', productCount: 96 },
  { id: 'c5', slug: 'for-kids', name: 'For Kids', icon: 'toys', color: categoryColors['for-kids'], image: '/images/image%2020.png', productCount: 210 },
]

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'Smart\nSchool\nShopping',
    subtitle: 'Find Everything\nFor Your School In One Place',
    cta: 'Explore Now',
    href: ROUTES.products,
    image: '/components/carousel.png',
    tone: 'bg-grad-hero',
  },
  {
    id: 'b2',
    title: 'Back to\nSchool Sale',
    subtitle: 'Up to 30% off\nnotebooks, kits & more',
    cta: 'Shop Deals',
    href: `${ROUTES.products}?tag=deal`,
    image: '/components/carousel.png',
    tone: 'bg-grad-hero',
  },
  {
    id: 'b3',
    title: 'Monsoon\nReady Kids',
    subtitle: 'Umbrellas, raincoats\nand bag covers',
    cta: 'Stay Dry',
    href: ROUTES.category('for-kids'),
    image: '/components/carousel.png',
    tone: 'bg-grad-hero',
  },
  {
    id: 'b4',
    title: 'From the\nHouse of PPD',
    subtitle: '100 years of\neducational excellence',
    cta: 'Discover PPD',
    href: ROUTES.category('books'),
    image: '/components/carousel.png',
    tone: 'bg-grad-hero',
  },
]
