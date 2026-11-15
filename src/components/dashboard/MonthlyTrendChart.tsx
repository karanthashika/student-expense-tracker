import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyTotal } from '@/utils/analytics';
import { formatCurrency, formatMonthLabel } from '@/utils/format';

interface MonthlyTrendChartProps {
  data: MonthlyTotal[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((item) => ({ label: formatMonthLabel(item.monthKey), spend: item.spend }));

  if (data.every((item) => item.spend === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        Your monthly trend will appear once you record some expenses.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value)).replace(/\.00$/, '')}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
          />
          <Bar dataKey="spend" fill="#0d9488" radius={[6, 6, 0, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
