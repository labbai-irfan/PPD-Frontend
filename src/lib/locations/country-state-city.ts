// @ts-ignore
import {
  getCountries,
  getCountryNameByCode,
  getStatesOfCountry,
  getStateNameByCode,
  getCitiesOfState,
  searchCitiesByName,
  type ICountry,
  type IState,
  type ICity,
} from '@countrystatecity/countries-browser'

export type { ICountry, IState, ICity }

let countriesCache: ICountry[] | null = null
const statesCache = new Map<string, IState[]>()
const citiesCache = new Map<string, ICity[]>()

export async function loadCountries(): Promise<ICountry[]> {
  if (!countriesCache) {
    countriesCache = await getCountries()
  }
  return countriesCache || []
}

export async function loadStates(countryCode: string): Promise<IState[]> {
  const key = countryCode.toUpperCase()
  if (!statesCache.has(key)) {
    statesCache.set(key, await getStatesOfCountry(key))
  }
  return statesCache.get(key) ?? []
}

export async function loadCities(countryCode: string, stateCode: string): Promise<ICity[]> {
  const key = `${countryCode.toUpperCase()}:${stateCode.toUpperCase()}`
  if (!citiesCache.has(key)) {
    citiesCache.set(key, await getCitiesOfState(countryCode.toUpperCase(), stateCode.toUpperCase()))
  }
  return citiesCache.get(key) ?? []
}

export async function searchCities(
  countryCode: string,
  stateCode: string,
  term: string,
): Promise<ICity[]> {
  const trimmed = term.trim()
  if (trimmed.length < 2) return loadCities(countryCode, stateCode)
  return searchCitiesByName(countryCode.toUpperCase(), stateCode.toUpperCase(), trimmed)
}

export async function resolveCountryCode(countryName: string): Promise<string | null> {
  if (!countryName.trim()) return null
  const countries = await loadCountries()
  const normalized = countryName.trim().toLowerCase()
  const match = countries.find(
    (country) =>
      country.name.toLowerCase() === normalized ||
      country.iso2.toLowerCase() === normalized ||
      country.iso3.toLowerCase() === normalized,
  )
  return match?.iso2 ?? null
}

export async function resolveStateCode(
  countryCode: string,
  stateName: string,
): Promise<string | null> {
  if (!stateName.trim()) return null
  const states = await loadStates(countryCode)
  const normalized = stateName.trim().toLowerCase()
  const match = states.find(
    (state) =>
      state.name.toLowerCase() === normalized || state.iso2.toLowerCase() === normalized,
  )
  return match?.iso2 ?? null
}

export async function getDisplayNames(
  countryCode: string,
  stateCode?: string,
): Promise<{ country: string; state?: string }> {
  const country = (await getCountryNameByCode(countryCode)) ?? countryCode
  const state = stateCode ? (await getStateNameByCode(countryCode, stateCode)) ?? stateCode : undefined
  return { country, state }
}

export function countryOptions(countries: ICountry[]) {
  return countries
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((country) => ({
      value: country.iso2,
      label: `${country.emoji} ${country.name}`,
      sublabel: country.iso2,
    }))
}

export function stateOptions(states: IState[]) {
  return states
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((state) => ({
      value: state.iso2,
      label: state.name,
      sublabel: state.iso2,
    }))
}

export function cityOptions(cities: ICity[]) {
  return cities
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((city) => ({
      value: city.name,
      label: city.name,
    }))
}
