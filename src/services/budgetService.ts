import { supabase } from '@/lib/supabase';
import type { ExpenseCategory } from '@/constants/finance';
import type { Budget } from '@/types/finance';

export async function listBudgets(userId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function upsertBudget(userId: string, category: ExpenseCategory, monthlyLimit: number) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert({ user_id: userId, category, monthly_limit: monthlyLimit }, { onConflict: 'user_id,category' })
    .select('*')
    .single();
  if (error) throw error;
  return data as Budget;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
}
