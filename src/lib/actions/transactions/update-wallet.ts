'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'
import { WalletType } from '@/types/database'

export async function updateWalletAction(
  id: string,
  data: {
    name?: string
    balance?: number
    currency?: string
    type?: WalletType
    icon?: string
    color?: string
  }
) {
  const supabase = await createClient()

  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated.' }

  try {
    const { error } = await supabase
      .from('wallets')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating wallet:', error)
      return { success: false, error: error.message }
    }

    // Revalidate Server Cache
    updateTag(`wallets-${user.id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error in updateWalletAction:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
