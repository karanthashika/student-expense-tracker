import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/LoadingScreen';
import { createTransaction, deleteTransaction, updateTransaction } from '@/services/transactionService';
import type { Transaction, TransactionInput } from '@/types/finance';
import { buildTransactionsCsv, downloadCsv } from '@/utils/csv';
import { formatCurrency, getErrorMessage, toDateKey } from '@/utils/format';
import { DEFAULT_FILTERS, filterTransactions, type TransactionFilterValues } from '@/utils/transactionFilters';

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; transaction: Transaction };

export function TransactionsPage() {
  const { user } = useAuth();
  const { transactions, loading, error, reload } = useFinanceData();
  const [filters, setFilters] = useState<TransactionFilterValues>(DEFAULT_FILTERS);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, t) => {
          if (t.type === 'income') acc.income += t.amount;
          else acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 },
      ),
    [filtered],
  );

  const handleSave = async (input: TransactionInput) => {
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    if (formState.mode === 'edit') {
      await updateTransaction(formState.transaction.id, input);
    } else {
      await createTransaction(user.id, input);
    }
    setFormState({ mode: 'closed' });
    await reload();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'We could not delete this transaction. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    downloadCsv(`expense-statement-${toDateKey(new Date())}.csv`, buildTransactionsCsv(filtered));
  };

  const hasAnyTransactions = transactions.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Ledger</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Transactions</h1>
          <p className="mt-2 text-sm text-slate-600">Record every rupee in and out, then filter or export your statement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setFormState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Add transaction
          </Button>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card>
        <TransactionFilters values={filters} onChange={setFilters} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Showing</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{filtered.length} transactions</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Income</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{formatCurrency(totals.income)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Expenses</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totals.expense)}</p>
        </div>
      </div>

      <Card>
        {loading && !hasAnyTransactions ? (
          <InlineLoader />
        ) : !hasAnyTransactions ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">No transactions yet</p>
            <p className="max-w-sm text-sm text-slate-500">Add your first expense or income to start building your statement.</p>
            <Button onClick={() => setFormState({ mode: 'create' })} className="mt-2">
              <Plus className="h-4 w-4" />
              Add your first transaction
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">No transactions match these filters</p>
            <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          </div>
        ) : (
          <TransactionList
            transactions={filtered}
            onEdit={(transaction) => setFormState({ mode: 'edit', transaction })}
            onDelete={(transaction) => {
              setDeleteError(null);
              setDeleteTarget(transaction);
            }}
          />
        )}
      </Card>

      {formState.mode !== 'closed' && (
        <TransactionFormModal
          initial={formState.mode === 'edit' ? formState.transaction : null}
          onSave={handleSave}
          onClose={() => setFormState({ mode: 'closed' })}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete transaction?"
        message={
          deleteTarget
            ? `This will permanently remove the ${formatCurrency(deleteTarget.amount)} ${deleteTarget.type} entry. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
