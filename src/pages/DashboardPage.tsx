import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart';
import { BudgetAlerts } from '@/components/budgets/BudgetAlerts';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/LoadingScreen';
import { createTransaction } from '@/services/transactionService';
import type { TransactionInput } from '@/types/finance';
import { computeBudgetProgress, computeDashboardStats } from '@/utils/analytics';
import { formatMonthLabel, getMonthKey } from '@/utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile, transactions, budgets, loading, error, reload } = useFinanceData();
  const [formOpen, setFormOpen] = useState(false);

  const stats = useMemo(
    () => computeDashboardStats(transactions, profile?.monthly_allowance ?? 0),
    [transactions, profile],
  );
  const progress = useMemo(() => computeBudgetProgress(budgets, transactions), [budgets, transactions]);

  const firstName = profile?.full_name.trim().split(' ')[0] || 'there';
  const monthLabel = formatMonthLabel(getMonthKey());

  const handleCreate = async (input: TransactionInput) => {
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    await createTransaction(user.id, input);
    setFormOpen(false);
    await reload();
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">{monthLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Hi {firstName}, here is your month at a glance
          </h1>
        </div>
        <Button onClick={() => setFormOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add transaction
        </Button>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && !profile ? (
        <InlineLoader />
      ) : (
        <>
          <SummaryCards stats={stats} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <Card title="Spending by category" description="Where this month's money went" className="xl:col-span-2">
              <CategoryDonut data={stats.categoryBreakdown} />
            </Card>
            <Card title="Monthly spending trend" description="Last six months" className="xl:col-span-3">
              <MonthlyTrendChart data={stats.monthlyTrend} />
            </Card>
          </div>

          <Card
            title="Budget alerts"
            description="Warnings appear at 80% of a category budget and alerts at 100%"
            action={
              <Link to="/budgets" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
                Manage budgets
              </Link>
            }
          >
            {budgets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No budgets yet.{' '}
                <Link to="/budgets" className="font-semibold text-teal-700 hover:text-teal-800">
                  Set a monthly limit
                </Link>{' '}
                for a category to get alerts here.
              </p>
            ) : (
              <BudgetAlerts progress={progress} />
            )}
          </Card>
        </>
      )}

      {formOpen && <TransactionFormModal initial={null} onSave={handleCreate} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
