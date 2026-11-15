import type { Transaction } from '@/types/finance';

export type TypeFilter = 'all' | 'income' | 'expense';

export interface TransactionFilterValues {
  type: TypeFilter;
  category: string;
  paymentMode: string;
  from: string;
  to: string;
}

export const DEFAULT_FILTERS: TransactionFilterValues = {
  type: 'all',
  category: 'all',
  paymentMode: 'all',
  from: '',
  to: '',
};

export function filterTransactions(transactions: Transaction[], filters: TransactionFilterValues): Transaction[] {
  return transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.paymentMode !== 'all' && t.payment_mode !== filters.paymentMode) return false;
    if (filters.from && t.txn_date < filters.from) return false;
    if (filters.to && t.txn_date > filters.to) return false;
    return true;
  });
}
