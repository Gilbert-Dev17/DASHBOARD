'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function addIncomeAction(data: {
  amount: number
  accountId: string
  source: string
  note?: string
  date?: Date | string
}) {
  const supabase = await createClient()
   const user = await getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }


  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: data.accountId,
        category_id: null, // Income might not use expense categories
        title: data.note || data.source || 'Income',
        amount: data.amount, // Positive amount
        type: 'income',
        transfer_fee: 0,
        created_for_date: data.date
          ? (typeof data.date === 'string' ? data.date : new Date(data.date.getTime() - (data.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0])
          : new Date().toISOString().split('T')[0]
      })

    if (error) {
      console.error('Error inserting income:', error)
      return { success: false, error: error.message }
    }

    updateTag(`wallets-${user.id}`);
    updateTag(`categories-${user.id}`)
    updateTag(`transactions-${user.id}`)

    return { success: true }
  } catch (error: unknown) {
    console.error('Unexpected error in addIncomeAction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
