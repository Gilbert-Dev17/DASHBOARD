'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'

export async function addExpenseAction(data: {
  amount: number
  accountId: string
  categoryId: string
  note?: string
}) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  const user = authData.user

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      wallet_id: data.accountId,
      category_id: data.categoryId,
      title: data.note || 'Expense',
      amount: data.amount,
      type: 'expense',
      transferFee: 0,
      created_for_date: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error inserting expense:', error)
    return { success: false, error: error.message }
  }

  // Revalidate Server Cache
  updateTag(`wallets-${user.id}`)
  updateTag(`transactions-${user.id}`)
  updateTag(`snapshots-${user.id}`)

  return { success: true }
}
