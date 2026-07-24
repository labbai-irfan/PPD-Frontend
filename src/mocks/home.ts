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

export const yogaTiles: CategoryTile[] = []

export const yogaPromos: PromoCard[] = []

/** Category screen filter chips + All Products applied chips (from the design). */
export const categoryChips = ['Textbooks', 'Reference Books', 'Story Books', 'Workbooks']
export const popularSearches = ['Doms Geometry Box', 'Camlin Box', 'Geometry Box']
