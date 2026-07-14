import { X } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ComparisonProduct {
  id: string
  name: string
  price: number
  mrp: number
  rating: number
  stock: number
  features: string[]
}

const mockProducts: Record<string, ComparisonProduct> = {
  p1: {
    id: 'p1',
    name: 'A5 Classic Spiral Notebooks',
    price: 299,
    mrp: 400,
    rating: 4.8,
    stock: 150,
    features: ['Spiral bound', '100 pages', 'A5 size', 'Lined paper'],
  },
  p2: {
    id: 'p2',
    name: 'Premium Hardbound Notebook',
    price: 399,
    mrp: 500,
    rating: 4.6,
    stock: 89,
    features: ['Hardbound', '200 pages', 'A4 size', 'Premium paper'],
  },
  p3: {
    id: 'p3',
    name: 'Eco-Friendly Notebook',
    price: 199,
    mrp: 300,
    rating: 4.4,
    stock: 200,
    features: ['Recyclable', '80 pages', 'A5 size', 'Natural paper'],
  },
}

export default function CompareProductsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ids = searchParams.get('ids')?.split(',') || []

  const products = ids
    .slice(0, 4)
    .map((id) => mockProducts[id])
    .filter(Boolean) as ComparisonProduct[]

  if (products.length === 0) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="font-semibold text-foreground">No products to compare</p>
        <p className="mt-2 text-sm text-muted-foreground">Select products from search results to compare</p>
        <Button onClick={() => navigate('/products/all')} className="mt-4 w-full sm:w-auto">
          Browse Products
        </Button>
      </Card>
    )
  }

  const specs = ['Price', 'Original Price', 'Rating', 'Stock', 'Features']

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Compare Products</h1>
        <Button variant="outline" onClick={() => navigate('/products/all')} className="w-full sm:w-auto">
          Add More
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="sticky left-0 z-10 w-32 bg-muted p-3 font-semibold text-foreground md:p-4">Product</td>
              {products.map((product) => (
                <td key={product.id} className="min-w-[200px] border-l p-3 md:p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <button
                      onClick={() =>
                        navigate(`/products?compare=${ids.filter((id) => id !== product.id).join(',')}`)
                      }
                      className="flex min-h-[44px] items-center gap-1 py-2 text-sm text-destructive hover:underline"
                    >
                      <X className="size-4" />
                      Remove
                    </button>
                  </div>
                </td>
              ))}
            </tr>

            {specs.map((spec) => (
              <tr key={spec} className="border-b">
                <td className="sticky left-0 z-10 bg-muted p-3 font-semibold text-foreground md:p-4">{spec}</td>
                {products.map((product) => (
                  <td key={product.id} className="border-l p-3 text-muted-foreground md:p-4">
                    {spec === 'Price' && `₹${product.price}`}
                    {spec === 'Original Price' && `₹${product.mrp}`}
                    {spec === 'Rating' && `⭐ ${product.rating}`}
                    {spec === 'Stock' && `${product.stock} items`}
                    {spec === 'Features' && (
                      <ul className="space-y-1 text-sm">
                        {product.features.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                ))}
              </tr>
            ))}

            <tr>
              <td className="sticky left-0 z-10 bg-background p-3 md:p-4"></td>
              {products.map((product) => (
                <td key={product.id} className="border-l p-3 md:p-4">
                  <Button className="w-full">Add to Cart</Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
