import { Activity, CalendarRange, Sparkles, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { CATEGORY_META } from '@/constants/finance';
import type { DashboardStats } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

interface SummaryCardsProps {
  stats: DashboardStats;
}

function StatCard({ label, value, hint, icon, tone }: { label: string; value: ReactNode; hint: string; icon: ReactNode; tone: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const top = stats.topCategory;
  const TopIcon = top ? CATEGORY_META[top.category].icon : Sparkles;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Remaining this month"
        value={formatCurrency(stats.remainingBalance)}
        hint="Allowance plus income minus spending"
        icon={<Wallet className="h-4 w-4" />}
        tone={stats.remainingBalance < 0 ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'}
      />
      <StatCard
        label="Monthly spend"
        value={formatCurrency(stats.monthlySpend)}
        hint="Total expenses this month"
        icon={<CalendarRange className="h-4 w-4" />}
        tone="bg-sky-100 text-sky-700"
      />
      <StatCard
        label="Daily average"
        value={formatCurrency(stats.dailyAverage)}
        hint="Spend per day so far this month"
        icon={<Activity className="h-4 w-4" />}
        tone="bg-amber-100 text-amber-700"
      />
      <StatCard
        label="Top expense category"
        value={top ? top.category : 'No spending yet'}
        hint={top ? `${formatCurrency(top.amount)} this month` : 'Add an expense to see your top category'}
        icon={<TopIcon className="h-4 w-4" />}
        tone="bg-slate-200 text-slate-700"
      />
    </div>
  );
}
