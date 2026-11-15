import type { Transaction } from '@/types/finance';

const CSV_HEADER = ['Date', 'Type', 'Category', 'Payment Mode', 'Amount (INR)', 'Note'];

const escapeCsvCell = (value: string | number) => {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildTransactionsCsv(transactions: Transaction[]): string {
  const rows = transactions.map((t) =>
    [t.txn_date, t.type, t.category, t.payment_mode, t.amount.toFixed(2), t.note]
      .map(escapeCsvCell)
      .join(','),
  );
  return [CSV_HEADER.join(','), ...rows].join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
