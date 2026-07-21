import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { type ExpenseCategory, Wallet as WalletSummary } from '@/types/database'

export function useWallets() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
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
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as ExpenseCategory[]
    }
  })
}

// import { WalletSummary } from '@/types/expenses'
// import type { ExpenseCategory } from '@/types/database'
// import { cacheTag } from 'next/cache'
// import { getUser } from '@/lib/auth/get-user'
// import { supabaseAdmin } from '@/lib/supabase/admin'

// async function fetchWallets(userId: string) {
//   'use cache'
//   cacheTag(`wallets-${userId}`)

//   const {data, error} = await supabaseAdmin.from('wallets')
//   .select('*')
//   .order('created_at', {ascending: true})

//   if (error) throw error

//   return data as WalletSummary[];
// }

// export async function useWallets() {
//   const user = await getUser();

//   if (!user) return { success: false, message: 'Not authenticated.' }

//   return fetchWallets(user.id)
// }
