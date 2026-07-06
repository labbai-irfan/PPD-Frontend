import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

/** The PPD image logo. */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/PPD%20Logo.png"
      alt="PPD"
      className={cn('w-[56px] h-auto object-contain', className)}
    />
  )
}

