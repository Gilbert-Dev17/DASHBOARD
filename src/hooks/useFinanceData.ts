import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WalletSummary } from '@/types/dashboard'
import type { ExpenseCategory } from '@/types/database'

export function useWallets() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('name')
      
      if (error) throw error
      // Assuming Supabase returns an array that matches WalletSummary
      return data as WalletSummary[]
    }
  })
}

export function useExpenseCategories() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['expense_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as ExpenseCategory[]
    }
  })
}
