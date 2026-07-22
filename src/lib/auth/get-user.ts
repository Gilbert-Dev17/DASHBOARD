import { createClient } from "../supabase/server";
import type { UserSummary } from "@/types/dashboard";

export async function getUser(): Promise<UserSummary | null> {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data: profile, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 is the code for "no rows returned", which is fine if they don't have a profile yet
        console.error("Error fetching profile:", error);
    }

    return {
        id: user.id ?? null,
        email: user.email ?? '',
        // Use the profile name if it exists, otherwise fallback to Google's user_metadata
        first_name: profile?.first_name ??
            user.user_metadata?.name?.split(' ')[0] ??
            user.user_metadata?.full_name?.split(' ')[0] ?? null,
        name: profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        activeCurrency: profile?.activecurrency ?? null
    }
}