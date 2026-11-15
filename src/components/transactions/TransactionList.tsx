import { ArrowDownLeft, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_META, INCOME_CATEGORY, type ExpenseCategory } from '@/constants/finance';
import type { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/format';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income';
        const meta = isIncome ? null : CATEGORY_META[transaction.category as ExpenseCategory];
        const Icon = meta?.icon;
        return (
          <li
            key={transaction.id}
            className="group flex items-center gap-4 py-4 transition-colors hover:bg-slate-50/70 sm:px-2"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isIncome ? 'bg-emerald-100 text-emerald-700' : meta?.tint
              }`}
            >
              {Icon ? <Icon className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {transaction.note || transaction.category}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {formatDate(transaction.txn_date)} &middot; {transaction.category === INCOME_CATEGORY ? 'Income' : transaction.category} &middot;{' '}
                {transaction.payment_mode}
              </p>
            </div>

            <p className={`shrink-0 text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-700' : 'text-slate-900'}`}>
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>

            <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label={`Edit ${transaction.note || transaction.category}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(transaction)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete ${transaction.note || transaction.category}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
