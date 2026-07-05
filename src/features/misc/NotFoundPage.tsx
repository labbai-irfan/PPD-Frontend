import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={<Compass />}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={
        <Link to={ROUTES.home}>
          <Button>Back to home</Button>
        </Link>
      }
    />
  )
}
