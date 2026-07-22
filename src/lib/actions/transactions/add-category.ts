'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { getUser } from '@/lib/auth/get-user'

export async function addCategoryAction(data: {
  name: string
  icon: string
  color: string
}) {
  const supabase = await createClient()

  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated.' }

  try {
    const { error } = await supabase
      .from('expense_categories')
      .insert({
        user_id: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color
      })

    if (error) {
      console.error('Error inserting category:', error)
      return { success: false, error: error.message }
    }

    updateTag(`categories-${user.id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error in addCategoryAction:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
