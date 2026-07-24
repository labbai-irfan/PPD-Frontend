declare module '@countrystatecity/countries-browser' {
  export interface ICountry {
    name: string
    iso2: string
    iso3: string
    [key: string]: any
  }
  export interface IState {
    name: string
    iso2: string
    [key: string]: any
  }
  export interface ICity {
    name: string
    [key: string]: any
  }

  export function getCountries(): Promise<ICountry[]>
  export function getCountryNameByCode(code: string): string
  export function getStatesOfCountry(countryCode: string): Promise<IState[]>
  export function getStateNameByCode(code: string): string
  export function getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]>
  export function searchCitiesByName(countryCode: string, stateCode: string, name: string): Promise<ICity[]>
}
