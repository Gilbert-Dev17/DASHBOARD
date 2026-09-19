'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import { withAuth } from '@/lib/auth/with-auth'

export const addCategoryAction = withAuth(async (user, data: {
  name: string
  icon: string
  color: string
}) => {
  const supabase = await createClient()
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
  })
