'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cacheTag, cacheLife } from 'next/cache'
import type { TransactionHistory, CategorySummary, FinancialSummary } from '@/types/expenses'
import { getUser } from "@/lib/auth/get-user"

async function fetchCachedMonthlyTransactions(userId: string, startDate: string, endDate: string){
    'use cache'
    cacheLife('hours')
    cacheTag(`transactions-${userId}`)

    const {data, error} = await supabaseAdmin
    .from('transactions')
    .select(`
        *,
        expense_categories ( name ),
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
        note: txn.title,
        category: txn.expense_categories?.name || 'Uncategorized',
        walletName: txn.wallets?.name || 'Unknown',
        currency: txn.wallets?.currency || 'PHP'
    }));

    return mappedData as TransactionHistory[];
}

export async function getMonthlyTransactions(userId: string){
    const user = await getUser();

    if (!user || user.id !== userId) throw new Error('Unauthorized or invalid user ID');

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    return fetchCachedMonthlyTransactions(userId, startDate, endDate)
}

async function fetchCachedCategories(userId: string){
    'use cache'
    cacheLife('days')
    cacheTag(`categories-${userId}`)

    const {data, error} = await supabaseAdmin
    .from('expense_categories')
    .select('*')
    .eq('user_id', userId)

   if (error) {
        console.error("Error fetching categories:", error.message)
        return []
    }
    return data as CategorySummary[]
}

export async function getExpenseCategories(userId: string) {
    const user = await getUser();

    if (!user || user.id !== userId) throw new Error('Unauthorized')

    return fetchCachedCategories(userId)
}

export async function getFinancialSummary(userId: string): Promise<FinancialSummary> {
    const user = await getUser();

    if (!user || user.id !== userId) throw new Error('Unauthorized')

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: wallets } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId)
    const totalBalance = (wallets || []).reduce((acc, w) => acc + (w.balance || 0), 0)

    const transactions = await fetchCachedMonthlyTransactions(userId, startDate, endDate)

    let income = 0
    let expense = 0

    transactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount)
        if (t.type === 'expense') expense += Number(t.amount)
    })
    
    return {
        balance: totalBalance,
        income,
        expense,
        currency: 'PHP'
    }
}
