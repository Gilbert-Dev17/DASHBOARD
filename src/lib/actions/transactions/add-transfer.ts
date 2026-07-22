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
}) {
  const supabase = await createClient()
   const user = await getUser();
    if (!user) return { success: false, message: 'Not authenticated.' }

  const fee = data.transferFee || 0

  // Since the Transaction table only has one `wallet_id`,
  // a standard way to represent a transfer is to create two records:
  // one for the money leaving the source, and one for the money entering the destination.

  try {
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          wallet_id: data.fromAccountId,
          category_id: null,
          title: data.note || 'Transfer Out',
          amount: -(data.amount + fee), // Subtract amount + fee from source
          type: 'transfer',
          transferFee: fee,
          created_for_date: new Date().toISOString().split('T')[0]
        },
        {
          user_id: user.id,
          wallet_id: data.toAccountId,
          category_id: null,
          title: data.note || 'Transfer In',
          amount: data.amount, // Add amount to destination
          type: 'transfer',
          transferFee: 0,
          created_for_date: new Date().toISOString().split('T')[0]
        }
      ])

    if (error) {
      console.error('Error inserting transfer:', error)
      return { success: false, error: error.message }
    }

    // Revalidate Server Cache
    updateTag(`wallets-${user.id}`)
    updateTag(`transactions-${user.id}`)
    updateTag(`snapshots-${user.id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error in addTransferAction:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
