'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cacheTag, cacheLife } from 'next/cache'
import type { TransactionHistory, FinancialSummary } from '@/types/expenses'
import { getUser } from "@/lib/auth/get-user"
import { calculateFinancialTotals } from "@/utils/financial"

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

    const mappedData = data.map((txn: any) => ({
        ...txn,
        date: txn.created_for_date,
        category: txn.expense_categories?.name || 'Uncategorized',
        walletName: txn.wallets?.name || 'Unknown',
        currency: txn.wallets?.currency || 'PHP'
    }));

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

export async function getFinancialSummary(userId: string): Promise<FinancialSummary> {
    const user = await getUser();

    if (!user || user.id !== userId) throw new Error('Unauthorized')

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: wallets } = await supabaseAdmin.from('wallets').select('*').eq('user_id', userId)
    const transactions = await fetchCachedMonthlyTransactions(userId, startDate, endDate)

    const { netWorth, income, expense, currency } = calculateFinancialTotals(
        wallets as any[],
        [],
        transactions
    );

    return {
        balance: netWorth,
        income,
        expense,
        currency
    }
}
