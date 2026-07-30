'use server'

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getUser } from "@/lib/auth/get-user"
import { cacheTag } from "next/cache"
import { CategoryWithTotal } from "@/types/expenses"

async function fetchCategoriesWithTotal(userId: string) {
    'use cache'
    cacheTag(`categories-${userId}`)
    cacheTag(`transactions-${userId}`)

    const { data, error } = await supabaseAdmin
        .from('expense_categories')
        .select(`
            *,
            transactions (
                amount,
                type,
                wallets ( currency )
            )
        `)
        .eq('user_id', userId)

    if (error) throw error;
    
    interface RawCategoryTx { amount: number; type: string; wallets?: { currency?: string } | null; }
    interface RawCategory {
      id: string;
      name: string;
      icon: string;
      color: string;
      user_id: string;
      created_at: string;
      transactions?: RawCategoryTx[] | null;
    }

    const result: CategoryWithTotal[] = ((data as unknown as RawCategory[]) || []).map((cat: RawCategory) => {
        let total = 0;
        let currency = 'PHP';

        // Sum only the 'expense' type transactions
        const expenses = (cat.transactions || []).filter((tx: RawCategoryTx) => tx.type === 'expense');

        expenses.forEach((tx: RawCategoryTx) => {
            total += tx.amount;
            if (tx.wallets?.currency) currency = tx.wallets.currency;
        });

        return {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            user_id: cat.user_id,
            created_at: cat.created_at,
            total_expense: total,
            currency
        }
    });

    // Sort by total expense descending
    result.sort((a, b) => b.total_expense - a.total_expense);

    return result;
}

export async function getCategoriesWithTotals(userId: string){
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized or invalid user ID');
    }

    return fetchCategoriesWithTotal(userId);
}