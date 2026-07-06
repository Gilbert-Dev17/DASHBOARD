import { createClient } from "../supabase/server";

export async function getUser() {
    const supabase = await createClient()

    const {data: {user: authUser}} = await supabase.auth.getUser();

    if (!authUser) return null;
}