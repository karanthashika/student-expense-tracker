import { supabase } from '@/lib/supabase';

const toFriendlyAuthError = (message: string) => {
  const lower = message.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (lower.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Network error. Check your connection and try again.';
  }
  return message;
};

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(toFriendlyAuthError(error.message));
}

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  monthlyAllowance: number;
}

export async function signUp({ email, password, fullName, monthlyAllowance }: SignUpInput) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, monthly_allowance: monthlyAllowance } },
  });
  if (error) throw new Error(toFriendlyAuthError(error.message));
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(toFriendlyAuthError(error.message));
}
