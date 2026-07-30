'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";


const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000'
  
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

export async function GoogleLogIn() {
    const supabase = await createClient();

    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
        redirectTo: `${getURL()}callback`,
        skipBrowserRedirect: false,
    },
    })

    if (error) {
        throw new Error(error.message);
    }

    if (data.url) {redirect(data.url)}
}