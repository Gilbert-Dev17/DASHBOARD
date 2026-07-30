'use server'

import { createClient } from "@/lib/supabase/server"
import { updateTag } from "next/cache"
import { getUser } from "@/lib/auth/get-user"

export async function upsertDailyNote(dateStr: string, content: string) {
    try {
        const supabase = await createClient();
        const user = await getUser();
        if (!user) return { success: false, message: 'Not authenticated' }

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

    } catch (error: unknown) {
        console.error('Unexpected error in upsertDailyNote:', error)
        return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred' }
    }
}
