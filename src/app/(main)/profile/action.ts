'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateDefaultCurrency(userId: string, newCurrency: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ activeCurrency: newCurrency })
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
