import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Input } from '@/components/ui/Input'
import {
  cityOptions,
  countryOptions,
  getDisplayNames,
  loadCities,
  loadCountries,
  loadStates,
  resolveCountryCode,
  resolveStateCode,
  stateOptions,
} from '@/lib/locations/country-state-city'
import { lookupPincode } from '@/services/locations.service'

export interface LocationValue {
  country: string
  state: string
  city: string
  pincode: string
}

interface LocationPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  errors?: Partial<Record<keyof LocationValue, string>>
  defaultCountryCode?: string
  showPincode?: boolean
  optionalFields?: Array<'state' | 'city' | 'pincode'>
}

export function LocationPicker({
  value,
  onChange,
  errors,
  defaultCountryCode = 'IN',
  showPincode = true,
  optionalFields = [],
}: LocationPickerProps) {
  const [countries, setCountries] = useState<Awaited<ReturnType<typeof loadCountries>>>([])
  const [states, setStates] = useState<Awaited<ReturnType<typeof loadStates>>>([])
  const [cities, setCities] = useState<Awaited<ReturnType<typeof loadCities>>>([])

  const [countryCode, setCountryCode] = useState('')
  const [stateCode, setStateCode] = useState('')

  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [lookingUpPincode, setLookingUpPincode] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const lastLookupRef = useRef('')

  const isIndia = countryCode === 'IN'
  const isOptional = (field: 'state' | 'city' | 'pincode') => optionalFields.includes(field)

  useEffect(() => {
    let cancelled = false
    void loadCountries().then((data) => {
      if (cancelled) return
      setCountries(data)
      setLoadingCountries(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loadingCountries || initialized) return

    let cancelled = false
    async function bootstrap() {
      let code = defaultCountryCode
      if (value.country) {
        const resolved = await resolveCountryCode(value.country)
        if (resolved) code = resolved
      }

      if (cancelled) return
      setCountryCode(code)

      const names = await getDisplayNames(code)
      if (cancelled) return

      if (!value.country) {
        onChange({ ...value, country: names.country })
      }

      if (value.state) {
        const resolvedState = await resolveStateCode(code, value.state)
        if (cancelled) return
        if (resolvedState) setStateCode(resolvedState)
      }

      setInitialized(true)
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [defaultCountryCode, initialized, loadingCountries, onChange, value])

  useEffect(() => {
    if (!countryCode) {
      setStates([])
      setStateCode('')
      return
    }

    let cancelled = false
    setLoadingStates(true)
    void loadStates(countryCode).then((data) => {
      if (cancelled) return
      setStates(data)
      setLoadingStates(false)
    })
    return () => {
      cancelled = true
    }
  }, [countryCode])

  useEffect(() => {
    if (!countryCode || !stateCode) {
      setCities([])
      return
    }

    let cancelled = false
    setLoadingCities(true)
    void loadCities(countryCode, stateCode).then((data) => {
      if (cancelled) return
      setCities(data)
      setLoadingCities(false)
    })
    return () => {
      cancelled = true
    }
  }, [countryCode, stateCode])

  const handleCountryChange = async (code: string) => {
    setCountryCode(code)
    setStateCode('')
    setCities([])
    const names = await getDisplayNames(code)
    onChange({
      country: names.country,
      state: '',
      city: '',
      pincode: isIndia ? value.pincode : '',
    })
  }

  const handleStateChange = async (code: string) => {
    setStateCode(code)
    const stateName = (await getDisplayNames(countryCode, code)).state ?? ''
    onChange({
      ...value,
      state: stateName,
      city: '',
    })
  }

  const handleCityChange = (cityName: string) => {
    onChange({ ...value, city: cityName })
  }

  const handlePincodeChange = (pincode: string) => {
    const digits = pincode.replace(/\D/g, '').slice(0, 6)
    onChange({ ...value, pincode: digits })
  }

  useEffect(() => {
    if (!isIndia || value.pincode.length !== 6) return
    if (lastLookupRef.current === value.pincode) return

    const pincode = value.pincode
    const timer = setTimeout(() => {
      lastLookupRef.current = pincode
      setLookingUpPincode(true)
      void lookupPincode(pincode)
        .then(async (result) => {
          if (!result) return

          const resolvedState = await resolveStateCode('IN', result.state)
          if (resolvedState) {
            setStateCode(resolvedState)
            const stateName = (await getDisplayNames('IN', resolvedState)).state ?? result.state
            onChange({
              country: value.country || 'India',
              state: stateName,
              city: result.city,
              pincode: result.pincode,
            })
            return
          }

          onChange({
            ...value,
            state: result.state,
            city: result.city,
            pincode: result.pincode,
          })
        })
        .finally(() => setLookingUpPincode(false))
    }, 400)

    return () => clearTimeout(timer)
  }, [isIndia, onChange, value])

  const countrySelectOptions = useMemo(() => countryOptions(countries), [countries])
  const stateSelectOptions = useMemo(() => stateOptions(states), [states])
  const citySelectOptions = useMemo(() => cityOptions(cities), [cities])

  return (
    <div className="space-y-4">
      <SearchableSelect
        label="Country"
        placeholder="Select country"
        searchPlaceholder="Search countries…"
        options={countrySelectOptions}
        value={countryCode}
        onChange={(code) => void handleCountryChange(code)}
        error={errors?.country}
        loading={loadingCountries}
        emptyMessage="No countries found"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SearchableSelect
          label={isOptional('state') ? 'State (optional)' : 'State'}
          placeholder={countryCode ? 'Select state' : 'Select country first'}
          searchPlaceholder="Search states…"
          options={stateSelectOptions}
          value={stateCode}
          onChange={(code) => void handleStateChange(code)}
          error={errors?.state}
          disabled={!countryCode}
          loading={loadingStates}
          emptyMessage="No states found"
          hint={isOptional('state') ? 'Leave blank for country-wide rules' : undefined}
        />

        <SearchableSelect
          label={isOptional('city') ? 'City (optional)' : 'City'}
          placeholder={stateCode ? 'Select city' : 'Select state first'}
          searchPlaceholder="Search cities…"
          options={citySelectOptions}
          value={value.city}
          onChange={handleCityChange}
          error={errors?.city}
          disabled={!stateCode}
          loading={loadingCities || lookingUpPincode}
          emptyMessage="No cities found"
          hint={isOptional('city') ? 'Leave blank for state-wide rules' : undefined}
        />
      </div>

      {showPincode && (
        <Input
          label={isOptional('pincode') ? 'Pincode (optional)' : 'Pincode'}
          placeholder={isIndia ? '560001' : 'Postal code'}
          digitsOnly={isIndia}
          maxLength={isIndia ? 6 : 12}
          value={value.pincode}
          onChange={(event) => handlePincodeChange(event.target.value)}
          error={errors?.pincode}
          hint={
            isOptional('pincode')
              ? 'Leave blank for city-wide rules'
              : isIndia
                ? 'Enter 6 digits — state & city auto-fill for India'
                : undefined
          }
        />
      )}
    </div>
  )
}
