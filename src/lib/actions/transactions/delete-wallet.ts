'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function deleteWalletAction(id: string) {
  const supabase = await createClient()

  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated.' }

  // Due to foreign key constraints in Supabase, deleting a wallet 
  // might cascade delete its transactions if `on delete cascade` is set,
  // otherwise it will fail if transactions exist. 
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting wallet:', error)
    return { success: false, error: error.message }
  }

  // Revalidate Server Cache
  updateTag(`wallets-${user.id}`)

  return { success: true }
}
