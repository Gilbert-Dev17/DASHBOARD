'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function adjustBalanceAction(data: {
  walletId: string
  newBalance: number
  note?: string
}) {
  const supabase = await createClient()

  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

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
}