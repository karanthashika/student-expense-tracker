import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';
import type { BudgetProgress } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

interface BudgetAlertsProps {
  progress: BudgetProgress[];
}

export function BudgetAlerts({ progress }: BudgetAlertsProps) {
  const alerts = progress.filter((item) => item.status !== 'safe');

  if (alerts.length === 0) {
    if (progress.length === 0) return null;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Every budget is on track this month.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((item) => {
        const exceeded = item.status === 'exceeded';
        const Icon = exceeded ? OctagonAlert : AlertTriangle;
        const category = item.budget.category;
        const percent = Math.round(item.ratio * 100);
        return (
          <div
            key={item.budget.id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              exceeded ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-relaxed">
              <span className="font-semibold">{category}</span>{' '}
              {exceeded
                ? `is over budget: ${formatCurrency(item.spent)} spent of ${formatCurrency(item.budget.monthly_limit)} (${percent}%).`
                : `has reached ${percent}% of its budget: ${formatCurrency(item.spent)} of ${formatCurrency(item.budget.monthly_limit)}.`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
