'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function addTransferAction(data: {
  amount: number
  fromAccountId: string
  toAccountId: string
  transferFee?: number
  note?: string
  date?: Date
}) {
  const supabase = await createClient()
   const user = await getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }

  const fee = data.transferFee || 0

  // Since the Transaction table only has one `wallet_id`,
  // a standard way to represent a transfer is to create two records:
  // one for the money leaving the source, and one for the money entering the destination.

  try {
    const formattedDate = data.date
      ? new Date(data.date.getTime() - (data.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    const { error } = await supabase.rpc('transfer_funds', {
      p_user_id: user.id,
      p_from_wallet: data.fromAccountId,
      p_to_wallet: data.toAccountId,
      p_amount: data.amount,
      p_fee: fee,
      p_note: data.note || null,
      p_date: formattedDate
    })

    if (error) {
      console.error('Error inserting transfer via RPC:', error)
      // If the RPC raises our 'Insufficient balance' exception, we can return that to the UI
      if (error.message.includes('Insufficient balance')) {
        return { success: false, error: 'Insufficient balance in the source wallet.' }
      }
      return { success: false, error: error.message }
    }

    // Revalidate Server Cache
    updateTag(`wallets-${user.id}`)
    updateTag(`transactions-${user.id}`)
    updateTag(`snapshots-${user.id}`)

    return { success: true }
  } catch (error: unknown) {
    console.error('Unexpected error in addTransferAction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
