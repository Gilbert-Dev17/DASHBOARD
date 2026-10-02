'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { withAuth } from '@/lib/auth/with-auth'

export const adjustBalanceAction = withAuth(async (user, data: {
  walletId: string
  newBalance: number
  note?: string
}) => {
  const supabase = await createClient()

    const { error } = await supabase.rpc('adjust_wallet_balance', {
    p_wallet_id: data.walletId,
    p_new_balance: data.newBalance,
    p_note: data.note ?? null,
  })

  if (error) {
    console.error('Error adjusting balance:', error)
    return { success: false, error: error.message }
  }

  updateTag(`wallets-${user.id}`)
  updateTag(`transactions-${user.id}`)
  updateTag(`snapshots-${user.id}`)

  return { success: true }
})