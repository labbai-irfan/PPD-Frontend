import type { ChangeEvent } from 'react'
import { Input, type InputProps } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

/** Keep only the 10-digit Indian mobile number — strips +91 / 0 prefixes and formatting. */
function normalizeIndianMobile(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length > 10 && digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  return digits.slice(0, 10)
}

/**
 * Indian mobile number input with a fixed +91 prefix.
 * The stored value is always the bare 10-digit number; pasting
 * "+91 98765 43210" or "09876543210" is normalized automatically.
 */
export function PhoneInput({ onChange, ...props }: InputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const normalized = normalizeIndianMobile(e.target.value)
    if (normalized !== e.target.value) e.target.value = normalized
    onChange?.(e)
  }

  return (
    <Input
      type="tel"
      inputMode="numeric"
      className={cn('pl-[3.75rem]', props.className)}
      leftIcon={
        <div className="flex h-full items-center pr-2 border-r border-input/50 mr-2">
          <span className="text-sm font-semibold text-foreground/80 tracking-wide">+91</span>
        </div>
      }
      onChange={handleChange}
      {...props}
    />
  )
}
