import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SchemaData } from '@/components/shared/SchemaData'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Construct Schema JSON-LD
  const schemaListItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: window.location.origin,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.label,
      item: item.path ? `${window.location.origin}${item.path}` : window.location.href,
    })),
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaListItems,
  }

  return (
    <>
      <SchemaData data={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center flex-wrap gap-1 text-xs md:text-sm text-muted-foreground font-medium">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <div key={idx} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              {isLast || !item.path ? (
                <span className="text-foreground font-semibold truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="hover:text-primary transition-colors truncate max-w-[200px]">
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}

export default Breadcrumbs
