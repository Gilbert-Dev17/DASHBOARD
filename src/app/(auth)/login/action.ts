'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";


export async function GoogleLogIn() {
    const supabase = await createClient();

    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
        redirectTo: `http://localhost:3000/callback`,
        skipBrowserRedirect: false,
    },
    })

    if (error) {
        throw new Error(error.message);
    }

    if (data.url) {redirect(data.url)}
}