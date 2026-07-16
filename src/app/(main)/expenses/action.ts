'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cacheTag } from 'next/cache'
import { TransactionHistory } from '@/types/expenses'

async function fetchCachedIncomeExpense(userId: string, today: string){
    'use cache'
    cacheTag(`wallet-${userId}`)

    const {data: wallet, error} = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('created_for_date', today)

    if (error) {
        console.error("Error fetching Transaction:", error.message);
        throw error;
    }

    return wallet as TransactionHistory[];
}

export async function getIncomeExpense(userId: string, today: string){
    const supabase = await createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
    }

    return fetchCachedIncomeExpense(userId, today)
}