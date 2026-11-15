import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/finance';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(
  userId: string,
  values: { full_name: string; monthly_allowance: number },
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...values }, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}
