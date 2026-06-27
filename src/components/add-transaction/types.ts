import type { CurrencyKey, CategoryKey } from './schemas'

export interface Category {
  // id: string
  name: string
  iconKey: CategoryKey
}

export interface CurrencyOption {
  name: CurrencyKey
  label: string
  iconKey: CurrencyKey
}