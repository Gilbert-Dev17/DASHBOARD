'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { withAuth } from '@/lib/auth/with-auth'

export const DeleteTransaction = withAuth(async (user, transactionId: string) => {
  const supabase = await createClient()
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
})
