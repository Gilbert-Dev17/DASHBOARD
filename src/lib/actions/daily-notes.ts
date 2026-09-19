'use server'

import { createClient } from "@/lib/supabase/server"
import { updateTag } from "next/cache"
import { withAuth } from "@/lib/auth/with-auth"

export const upsertDailyNote = withAuth(async (user, dateStr: string, content: string) => {
    const supabase = await createClient();

    const { error } = await supabase
        .from('daily_notes')
        .upsert({
            user_id: user.id,
            date: dateStr,
            content: content,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        });

    if (error) {
        console.error('Error upserting daily note:', error)
        return { success: false, message: error.message }
    }

    updateTag(`daily-notes-${user.id}-${dateStr}`)
    return { success: true, message: 'Note saved successfully' }
})
