import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_META } from '@/constants/finance';
import type { CategoryTotal } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

interface CategoryDonutProps {
  data: CategoryTotal[];
}

export function CategoryDonut({ data }: CategoryDonutProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        No expenses this month yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="relative h-56 w-full sm:w-56 sm:shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              animationDuration={600}
            >
              {data.map((item) => (
                <Cell key={item.category} fill={CATEGORY_META[item.category].color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500">Total</span>
          <span className="text-base font-semibold text-slate-900">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-1 gap-3">
        {data.map((item) => {
          const share = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <li key={item.category} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_META[item.category].color }} />
                {item.category}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(item.amount)} <span className="text-xs font-normal text-slate-500">({share}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
