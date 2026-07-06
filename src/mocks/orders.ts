import type { Address, CartItem, Order } from '@/types'

/**
 * Demo orders so the Orders page has content before any real checkout.
 * Seeded into the orders store on first load when it's empty.
 */

const img = (seed: string) => `https://picsum.photos/seed/${seed}-1/800/800`

const address: Address = {
  id: 'addr-demo',
  name: 'Irfan Labbai',
  phone: '+91 98765 43210',
  line1: '12, Gandhi Street, Anna Nagar',
  line2: 'Near Reliance Fresh',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600040',
  type: 'home',
  isDefault: true,
}

const item = (p: Partial<CartItem> & Pick<CartItem, 'productId' | 'title' | 'brand' | 'price' | 'mrp'>): CartItem => ({
  quantity: 1,
  stock: 100,
  selections: {},
  ...p,
  key: p.key ?? p.productId,
  image: p.image ?? img(p.productId),
})

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const pricing = (items: CartItem[], discount = 0, shipping = 0): Order['pricing'] => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return { subtotal, discount, shipping, total: subtotal - discount + shipping }
}

export function seedOrders(): Order[] {
  const o1Items = [
    item({ productId: 'p1', title: 'Santoor With Activities Class 4 NCERT', brand: 'PPD', price: 299, mrp: 400 }),
    item({ productId: 'p2', title: 'Single Line Small Notebooks 76 Pages (Set of 6)', brand: 'Classmate', price: 140, mrp: 180, quantity: 2 }),
  ]
  const o2Items = [
    item({ productId: 'p7', title: 'Camlin Scholar Pro Geometry Box', brand: 'Camlin', price: 300, mrp: 350 }),
  ]
  const o3Items = [
    item({ productId: 'p3', title: 'DOMS Hexel Pen Blue 20 Pcs', brand: 'DOMS', price: 311, mrp: 400 }),
    item({ productId: 'p9', title: 'Shuttle Art 6 Pcs Highlighters', brand: 'Shuttle Art', price: 199, mrp: 260 }),
  ]

  return [
    {
      id: 'ORD-4821',
      items: o1Items,
      status: 'out-for-delivery',
      createdAt: daysAgo(2),
      address,
      payment: { method: 'upi', label: 'UPI · Google Pay' },
      pricing: pricing(o1Items, 40),
    },
    {
      id: 'ORD-4790',
      items: o2Items,
      status: 'shipped',
      createdAt: daysAgo(5),
      address,
      payment: { method: 'cod', label: 'Cash on Delivery' },
      pricing: pricing(o2Items, 0, 40),
    },
    {
      id: 'ORD-4655',
      items: o3Items,
      status: 'delivered',
      createdAt: daysAgo(12),
      address,
      payment: { method: 'card', label: 'Card · **** 4242' },
      pricing: pricing(o3Items, 50),
    },
  ]
}
