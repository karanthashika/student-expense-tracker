import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/constants/finance';
import type { Budget, Transaction } from '@/types/finance';
import { getMonthKey } from '@/utils/format';

export const WARNING_THRESHOLD = 0.8;

export interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
}

export interface MonthlyTotal {
  monthKey: string;
  spend: number;
}

export interface DashboardStats {
  remainingBalance: number;
  monthlySpend: number;
  monthlyIncome: number;
  dailyAverage: number;
  topCategory: CategoryTotal | null;
  categoryBreakdown: CategoryTotal[];
  monthlyTrend: MonthlyTotal[];
}

export type BudgetStatus = 'safe' | 'warning' | 'exceeded';

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  ratio: number;
  status: BudgetStatus;
}

const sumAmounts = (items: Transaction[]) => items.reduce((total, item) => total + item.amount, 0);

const spentByCategoryInMonth = (transactions: Transaction[], monthKey: string) => {
  const totals: Record<string, number> = {};
  for (const transaction of transactions) {
    if (transaction.type !== 'expense' || !transaction.txn_date.startsWith(monthKey)) continue;
    totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
  }
  return totals;
};

export function computeDashboardStats(
  transactions: Transaction[],
  monthlyAllowance: number,
  now: Date = new Date(),
): DashboardStats {
  const currentMonth = getMonthKey(now);
  const thisMonth = transactions.filter((t) => t.txn_date.startsWith(currentMonth));
  const monthlySpend = sumAmounts(thisMonth.filter((t) => t.type === 'expense'));
  const monthlyIncome = sumAmounts(thisMonth.filter((t) => t.type === 'income'));

  const totals = spentByCategoryInMonth(transactions, currentMonth);
  const categoryBreakdown = EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: totals[category] ?? 0,
  }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const monthlyTrend: MonthlyTotal[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthKey = getMonthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1));
    const spend = sumAmounts(
      transactions.filter((t) => t.type === 'expense' && t.txn_date.startsWith(monthKey)),
    );
    monthlyTrend.push({ monthKey, spend });
  }

  return {
    remainingBalance: monthlyAllowance + monthlyIncome - monthlySpend,
    monthlySpend,
    monthlyIncome,
    dailyAverage: now.getDate() > 0 ? monthlySpend / now.getDate() : 0,
    topCategory: categoryBreakdown[0] ?? null,
    categoryBreakdown,
    monthlyTrend,
  };
}

export function computeBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  now: Date = new Date(),
): BudgetProgress[] {
  const totals = spentByCategoryInMonth(transactions, getMonthKey(now));
  return budgets.map((budget) => {
    const spent = totals[budget.category] ?? 0;
    const ratio = spent / budget.monthly_limit;
    const status: BudgetStatus = ratio >= 1 ? 'exceeded' : ratio >= WARNING_THRESHOLD ? 'warning' : 'safe';
    return { budget, spent, ratio, status };
  });
}
