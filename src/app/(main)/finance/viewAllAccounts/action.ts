'use server'

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getUser } from "@/lib/auth/get-user"
import { Wallets, TransactionHistory } from "@/types/expenses"
import { cacheTag } from "next/cache"

async function fetchWallets(userId: string) {
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
    .order('created_at', {ascending: false})

    if (error) {
        console.error("Error fetching wallets:", error.message)
        throw error;
    }

    if (data) {
        data.forEach(wallet => {
            if (wallet.transactions) {
                // Sort transactions descending (newest first)
                wallet.transactions.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
            }
        });
    }

    return data as (Wallets & { transactions: TransactionHistory[] })[]
}

export async function getWallets(userId: string){
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
    }

    return fetchWallets(userId);
}