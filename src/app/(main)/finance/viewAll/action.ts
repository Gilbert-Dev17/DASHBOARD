'use server'

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getUser } from "@/lib/auth/get-user"
import { Wallets, TransactionHistory } from "@/types/expenses"
import { cacheTag } from "next/cache"

async function fetchTransactions(userId: string) {
    'use cache'
    cacheTag(`transactions-${userId}`)

   const {data, error} = await supabaseAdmin
    .from('transactions')
    .select(`
        *,
        expense_categories ( name, icon, color ),
        wallets ( name, currency )
    `)
    .eq('user_id', userId)
    .order('created_for_date', { ascending: false })

    if (error) {
        console.error("Error fetching Transaction:", error.message);
        return []
    }

    return data as TransactionHistory[];
}

export async function getAllTransaction(userId: string){
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
    }

    return fetchTransactions(userId);
}