'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function DeleteTransaction(transactionId: string) {
  const supabase = await createClient()

  const user = await getUser()
  if (!user) {
    return { success: false, message: 'Not authenticated.' }
  }

  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting transaction:', error)
      return { success: false, message: error.message }
    }

    updateTag(`wallets-${user.id}`)
    updateTag(`categories-${user.id}`)
    updateTag(`transactions-${user.id}`)
    updateTag(`snapshots-${user.id}`)

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error in DeleteTransaction:', err)
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}
