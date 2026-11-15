import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionInput } from '@/types/finance';

export async function listTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('txn_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function createTransaction(userId: string, input: TransactionInput) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
