import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/services/profileService';
import { listTransactions } from '@/services/transactionService';
import { listBudgets } from '@/services/budgetService';
import type { Budget, Profile, Transaction } from '@/types/finance';
import { getErrorMessage } from '@/utils/format';

export function useFinanceData() {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const [nextProfile, nextTransactions, nextBudgets] = await Promise.all([
        getProfile(userId),
        listTransactions(userId),
        listBudgets(userId),
      ]);
      setProfile(nextProfile);
      setTransactions(nextTransactions);
      setBudgets(nextBudgets);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not load your data. Please refresh the page.'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, transactions, budgets, loading, error, reload: load };
}
