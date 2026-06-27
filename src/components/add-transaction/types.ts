import type { CurrencyKey } from './schemas'

export interface Category {
  id: string
  name: string
  iconKey: string
}

export interface CurrencyOption {
  name: CurrencyKey
  label: string
  iconKey: CurrencyKey
}