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


