'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { DatabaseMetrics, TableCounts } from '@/types/database';

export async function updateDefaultCurrency(userId: string, newCurrency: string) {
  const supabase = createClient();

  try {
    const { error } = await (await supabase)
      .from('profiles')
      .update({ activecurrency: newCurrency })
      .eq('id', userId);


    if (error) {
      console.error('Error updating profile currency:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error updating profile:', error);
    return { success: false, error: error.message };
  }
}
export async function getProfileSystemMetrics() {
  const supabase = await createClient();

  try {
    const [{ data: dbSizeData }, { data: tableCountData }] = await Promise.all([
      supabase.rpc('get_database_size'),
      supabase.rpc('get_table_counts'),
    ]);

    const dbSize = dbSizeData as DatabaseMetrics | null;
    const tableCounts = tableCountData as TableCounts | null;

    return { success: true, dbSize, tableCounts };
  } catch (error: any) {
    console.error('Error fetching system metrics:', error);
    return { success: false, error: error.message, dbSize: null, tableCounts: null };
  }
}
