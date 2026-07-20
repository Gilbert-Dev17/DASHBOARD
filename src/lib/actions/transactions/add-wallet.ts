'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'
import { WalletType } from '@/types/database'

export async function addWalletAction(data: {
  name: string
  balance: number
  currency: string
  type: WalletType
  icon: string
  color: string
}) {
  const supabase = await createClient()

  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('wallets')
    .insert({
      user_id: user.id,
      name: data.name,
      balance: data.balance,
      currency: data.currency,
      type: data.type,
      icon: data.icon,
      color: data.color
    })

  if (error) {
    console.error('Error inserting wallet:', error)
    return { success: false, error: error.message }
  }

  // Revalidate Server Cache
  updateTag(`wallets-${user.id}`)

  return { success: true }
}
