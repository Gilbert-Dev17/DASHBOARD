'use client'

import { useQuery } from '@tanstack/react-query'
import { getWalletsAction, getExpenseCategoriesAction } from '@/lib/actions/financeData'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      return await getWalletsAction()
    }
  })
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense_categories'],
    queryFn: async () => {
      return await getExpenseCategoriesAction()
    }
  })
}
