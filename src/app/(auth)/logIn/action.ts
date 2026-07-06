'use server'

import {type LoginInput, loginSchema } from "@/lib/validations/login";
import { createClient } from "@/lib/supabase/server"


export async function LogIn(values: LoginInput) {
    const parsed = loginSchema.safeParse(values);

     if (!parsed.success) {
        return { ok: false, message: "Invalid input" };
    }

    const supabase = await createClient();
    const {error} = await supabase.auth.signInWithPassword(parsed.data);

    if(error){
        return { ok: false , error: error.message };
    }
      return { ok: true };
}