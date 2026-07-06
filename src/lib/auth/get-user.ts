import { createClient } from "../supabase/server";

export async function getUser() {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser();

    if (!user) return null;

    const {data: profile} = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

    return {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name ?? null,
    }
}