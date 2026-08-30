'use server'

import { cacheTag } from 'next/cache'
import { type ExpenseCategory, Wallet as WalletSummary } from '@/types/database'
import { getUser } from '@/lib/auth/get-user'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function fetchCachedWallet(userId: string) {
  'use cache'
  cacheTag(`wallets-${userId}`)

  const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
  if (error) throw error

  return data as WalletSummary[]
}

export async function getWalletsAction() {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  return fetchCachedWallet(user.id);
}

async function fetchCachedExpenseCategory(userId: string) {
  'use cache'
  cacheTag(`categories-${userId}`)

  const { data, error } = await supabaseAdmin
      .from('expense_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
  if (error) throw error

  return data as ExpenseCategory[]
}

export async function getExpenseCategoriesAction() {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  return fetchCachedExpenseCategory(user.id);
}
