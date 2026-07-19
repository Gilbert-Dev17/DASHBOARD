'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag, updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function addIncomeAction(data: {
  amount: number
  accountId: string
  source: string
  note?: string
}) {
  const supabase = await createClient()
   const user = await getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }


  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      wallet_id: data.accountId,
      category_id: null, // Income might not use expense categories
      title: data.note || data.source || 'Income',
      amount: data.amount, // Positive amount
      type: 'income',
      transferFee: 0,
      created_for_date: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error inserting income:', error)
    return { success: false, error: error.message }
  }

  updateTag(`wallets-${user.id}`);
  updateTag(`categories-${user.id}`)

  return { success: true }
}
