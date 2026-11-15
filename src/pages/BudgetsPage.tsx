import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { BudgetAlerts } from '@/components/budgets/BudgetAlerts';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetFormModal } from '@/components/budgets/BudgetFormModal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineLoader } from '@/components/ui/LoadingScreen';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/constants/finance';
import { deleteBudget, upsertBudget } from '@/services/budgetService';
import type { Budget } from '@/types/finance';
import { computeBudgetProgress } from '@/utils/analytics';
import { formatMonthLabel, getErrorMessage, getMonthKey } from '@/utils/format';

type FormState = { mode: 'closed' } | { mode: 'open'; budget: Budget | null };

export function BudgetsPage() {
  const { user } = useAuth();
  const { budgets, transactions, loading, error, reload } = useFinanceData();
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const progress = useMemo(() => computeBudgetProgress(budgets, transactions), [budgets, transactions]);
  const availableCategories = useMemo(() => {
    const used = new Set(budgets.map((b) => b.category));
    return EXPENSE_CATEGORIES.filter((category) => !used.has(category));
  }, [budgets]);

  const handleSave = async (category: ExpenseCategory, monthlyLimit: number) => {
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    await upsertBudget(user.id, category, monthlyLimit);
    setFormState({ mode: 'closed' });
    await reload();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'We could not remove this budget. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const canAddBudget = availableCategories.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">{formatMonthLabel(getMonthKey())}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Budgets</h1>
          <p className="mt-2 text-sm text-slate-600">Set a monthly limit per category and track how close you are to it.</p>
        </div>
        <Button onClick={() => setFormState({ mode: 'open', budget: null })} disabled={!canAddBudget} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add budget
        </Button>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && budgets.length === 0 ? (
        <InlineLoader />
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-900">No budgets set yet</p>
          <p className="max-w-sm text-sm text-slate-500">
            Give your food, travel or entertainment spending a monthly ceiling and you will get warned before you overspend.
          </p>
          <Button onClick={() => setFormState({ mode: 'open', budget: null })} className="mt-2">
            <Plus className="h-4 w-4" />
            Set your first budget
          </Button>
        </div>
      ) : (
        <>
          <BudgetAlerts progress={progress} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {progress.map((item) => (
              <BudgetCard
                key={item.budget.id}
                item={item}
                onEdit={() => setFormState({ mode: 'open', budget: item.budget })}
                onDelete={() => {
                  setDeleteError(null);
                  setDeleteTarget(item.budget);
                }}
              />
            ))}
          </div>
        </>
      )}

      {formState.mode === 'open' && (
        <BudgetFormModal
          initial={formState.budget}
          availableCategories={availableCategories}
          onSave={handleSave}
          onClose={() => setFormState({ mode: 'closed' })}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove budget?"
        message={
          deleteTarget
            ? `The ${deleteTarget.category} budget will be removed. Your transactions are not affected.`
            : ''
        }
        confirmLabel="Remove"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
