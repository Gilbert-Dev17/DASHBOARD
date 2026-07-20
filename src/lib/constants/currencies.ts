import {
  Landmark,
  CreditCard,
  TrendingUp,
  Bitcoin,
  Briefcase,
  Receipt,
  LucideIcon
} from 'lucide-react'
import { WalletType } from '@/types/database'

export const WALLET_STYLES: Record<WalletType, { icon: LucideIcon; color: string; iconName: string }> = {
  Debit: { icon: Landmark, color: '#4A90E2', iconName: 'Landmark' },
  Credit: { icon: CreditCard, color: '#C91111', iconName: 'CreditCard' },
  Assets: { icon: Briefcase, color: '#DDA15E', iconName: 'Briefcase' },
  Loans: { icon: Receipt, color: '#E36414', iconName: 'Receipt' },
  Stocks: { icon: TrendingUp, color: '#A3B18A', iconName: 'TrendingUp' },
  Crypto: { icon: Bitcoin, color: '#9B51E0', iconName: 'Bitcoin' },
}

export const WALLET_TYPES =[
  {value: 'Debit', label: 'Debit'},
  {value: 'Credit', label: 'Credit'},
  {value: 'Assets', label: 'Assets'},
  {value: 'Loans', label: 'Loans'},
  {value: 'Stocks', label: 'Stock'},
  {value: 'Crypto', label: 'Crypto'},
]

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
}

export const AVAILABLE_CURRENCIES: CurrencyInfo[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]
