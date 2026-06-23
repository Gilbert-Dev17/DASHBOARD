'use server'

import { createClient} from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signIn() {
    const supabase = await createClient()


}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}

export async function signUp() {
    const supabase = await createClient()
}