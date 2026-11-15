const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const pad = (value: number) => String(value).padStart(2, '0');

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getMonthKey = (date: Date = new Date()) => toDateKey(date).slice(0, 7);

export const formatDate = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatMonthLabel = (monthKey: string) =>
  new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  });

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
};
