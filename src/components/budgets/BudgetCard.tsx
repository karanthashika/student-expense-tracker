import { Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_META } from '@/constants/finance';
import type { BudgetProgress, BudgetStatus } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

const BAR_CLASS: Record<BudgetStatus, string> = {
  safe: 'bg-teal-500',
  warning: 'bg-amber-500',
  exceeded: 'bg-rose-500',
};

const BADGE: Record<BudgetStatus, { label: string; className: string }> = {
  safe: { label: 'On track', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  warning: { label: '80% reached', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  exceeded: { label: 'Over budget', className: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
};

interface BudgetCardProps {
  item: BudgetProgress;
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, ratio, status } = item;
  const meta = CATEGORY_META[budget.category];
  const Icon = meta.icon;
  const percent = Math.min(Math.round(ratio * 100), 100);
  const remaining = budget.monthly_limit - spent;

  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.tint}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{budget.category}</h3>
            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[status].className}`}>
              {BADGE[status].label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label={`Edit ${budget.category} budget`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Delete ${budget.category} budget`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-900">{formatCurrency(spent)}</span>
          <span className="text-slate-500">of {formatCurrency(budget.monthly_limit)}</span>
        </div>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${budget.category} budget used`}
        >
          <div className={`h-full rounded-full transition-all duration-700 ease-out ${BAR_CLASS[status]}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {remaining >= 0
            ? `${formatCurrency(remaining)} left this month (${percent}% used)`
            : `${formatCurrency(Math.abs(remaining))} over this month (${Math.round(ratio * 100)}% used)`}
        </p>
      </div>
    </article>
  );
}
