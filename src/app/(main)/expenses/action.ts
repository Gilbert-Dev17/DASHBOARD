'use server'

import { supabaseAdmin } from "@/lib/supabase/admin"
import { cacheTag, cacheLife } from 'next/cache'
import type { TransactionHistory } from '@/types/expenses'
import { getUser } from "@/lib/auth/get-user"

async function fetchCachedMonthlyTransactions(userId: string, startDate: string, endDate: string){
    'use cache'
    cacheLife('hours')
    cacheTag(`transactions-${userId}`)

    const {data, error} = await supabaseAdmin
    .from('transactions')
    .select(`
        *,
        expense_categories ( name, icon, color ),
        wallets ( name, currency )
    `)
    .eq('user_id', userId)
    .gte('created_for_date', startDate)
    .lte('created_for_date', endDate)
    .order('created_for_date', { ascending: false })


    if (error) {
        console.error("Error fetching Transaction:", error.message);
        return []
    }

    return data as TransactionHistory[];
}

export async function getMonthlyTransactions(userId: string){
    const user = await getUser();

    if (!user || user.id !== userId) throw new Error('Unauthorized or invalid user ID');

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    return fetchCachedMonthlyTransactions(userId, startDate, endDate)
}