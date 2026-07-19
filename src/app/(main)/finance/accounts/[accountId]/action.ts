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
    .single()

    if (error) {
        console.error("Error fetching walletId:", error.message)
        throw error;
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