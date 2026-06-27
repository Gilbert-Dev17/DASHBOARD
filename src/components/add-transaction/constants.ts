import {
  DrumstickIcon, ShoppingBag, Tv, Heart,
  ShoppingBasket, BusFront, School, HelpCircle,
} from 'lucide-react'
import {
  DollarSign, Euro, PoundSterling, JapaneseYen, PhilippinePeso,
} from 'lucide-react'
import type { Category, CurrencyOption } from './types'

export const CURRENCY_KEYS = [
  'dollar', 'euro', 'pound', 'yen', 'peso',
] as const

export const CATEGORY_IDS = [
  '1', '2', '3', '4', '5', '6', '7',
] as const

export const ICON_MAP: Record<string, React.ElementType> = {
  'foods-drinks' : DrumstickIcon,
  'shopping'     : ShoppingBag,
  'entertainment': Tv,
  'date'         : Heart,
  'groceries'    : ShoppingBasket,
  'transport'    : BusFront,
  'school'       : School,
  'fallback'     : HelpCircle,
}

export const CURRENCY_ICON_MAP: Record<string, React.ElementType> = {
  dollar : DollarSign,
  euro   : Euro,
  pound  : PoundSterling,
  yen    : JapaneseYen,
  peso   : PhilippinePeso,
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Foods & Drinks', iconKey: 'foods-drinks' },
  { id: '2', name: 'Shopping',       iconKey: 'shopping' },
  { id: '3', name: 'Entertainment',  iconKey: 'entertainment' },
  { id: '4', name: 'Date',           iconKey: 'date' },
  { id: '5', name: 'Groceries',      iconKey: 'groceries' },
  { id: '6', name: 'Transport',      iconKey: 'transport' },
  { id: '7', name: 'School',         iconKey: 'school' },
]

export const CURRENCIES: CurrencyOption[] = [
  { name: 'dollar', label: 'USD $', iconKey: 'dollar' },
  { name: 'euro',   label: 'EUR €', iconKey: 'euro' },
  { name: 'pound',  label: 'GBP £', iconKey: 'pound' },
  { name: 'yen',    label: 'JPY ¥', iconKey: 'yen' },
  { name: 'peso',   label: 'PHP ₱', iconKey: 'peso' },
]