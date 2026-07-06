import { createClient } from "../supabase/server";
import type { UserSummary } from "@/types/dashboard";

export async function getUser(): Promise<UserSummary | null> {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data: profile, error} = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

    if (error) console.error("Error fetching profile:", error);

    return {
        id: user.id ?? null,
        email: user.email ?? '',
        first_name: profile?.first_name ?? null,
    }
}