'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { withAuth } from '@/lib/auth/with-auth'
import { WalletType } from '@/types/database'

export const updateWalletAction = withAuth(async (user, 
  id: string,
  data: {
    name?: string
    balance?: number
    currency?: string
    type?: WalletType
    icon?: string
    color?: string
  }
) => {
  const supabase = await createClient()
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
  })
