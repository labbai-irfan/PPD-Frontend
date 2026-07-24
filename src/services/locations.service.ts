import { apiClient } from '@/services/api/client'

export interface PincodeLookupResult {
  pincode: string
  state: string
  city: string
  offices: Array<{
    name: string
    district: string
    state: string
    deliveryStatus: string
  }>
}

export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const normalized = pincode.replace(/\D/g, '')
  if (normalized.length !== 6) return null

  try {
    const { data } = await apiClient.get<PincodeLookupResult>(`/locations/pincode/${normalized}`)
    return data
  } catch {
    return null
  }
}
