'use server'

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getUser } from "@/lib/auth/get-user"
import { Wallets, TransactionHistory } from "@/types/expenses"
import { cacheTag } from "next/cache"

async function fetchWalletId(userId: string, accountId: string) {
    'use cache'
    cacheTag(`wallets-${userId}`)

    const {data, error} = await supabaseAdmin
    .from('wallets')
    .select(`*,
            transactions(*,
               expense_categories(name, icon, color)
            )
        `)
    .eq('user_id', userId)
    .eq('id', accountId)
    .order('created_at', {ascending: false})
    .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error("Error fetching walletId:", error.message)
        throw error;
    }

    if (data && data.transactions) {
        // Sort transactions descending (newest first)
        data.transactions.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return data as Wallets & { transactions: TransactionHistory[] }
}

export async function getWalletId(userId: string, accountId: string){
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
    }

    return fetchWalletId(userId, accountId);
}