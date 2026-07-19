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

export const WALLET_STYLES: Record<WalletType, { icon: LucideIcon; color: string }> = {
  Debit: { icon: Landmark, color: '#4A90E2' }, // Blue
  Credit: { icon: CreditCard, color: '#C91111' }, // Red
  Assets: { icon: Briefcase, color: '#DDA15E' }, // Gold
  Loans: { icon: Receipt, color: '#E36414' }, // Orange
  Stocks: { icon: TrendingUp, color: '#A3B18A' }, // Olive Green
  Crypto: { icon: Bitcoin, color: '#9B51E0' }, // Purple
}
