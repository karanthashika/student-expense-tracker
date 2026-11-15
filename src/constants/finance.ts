import type { LucideIcon } from 'lucide-react';
import { BookOpen, Home, Package, Plane, Ticket, Utensils } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'Food/Mess',
  'Hostel/Rent',
  'Books/Stationery',
  'Travel',
  'Entertainment',
  'Miscellaneous',
] as const;

export const PAYMENT_MODES = ['UPI', 'Cash', 'Card'] as const;

export const INCOME_CATEGORY = 'Income';

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type PaymentMode = (typeof PAYMENT_MODES)[number];
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = ExpenseCategory | typeof INCOME_CATEGORY;

export const CATEGORY_META: Record<ExpenseCategory, { icon: LucideIcon; color: string; tint: string }> = {
  'Food/Mess': { icon: Utensils, color: '#f97316', tint: 'bg-orange-100 text-orange-700' },
  'Hostel/Rent': { icon: Home, color: '#0ea5e9', tint: 'bg-sky-100 text-sky-700' },
  'Books/Stationery': { icon: BookOpen, color: '#10b981', tint: 'bg-emerald-100 text-emerald-700' },
  Travel: { icon: Plane, color: '#f59e0b', tint: 'bg-amber-100 text-amber-700' },
  Entertainment: { icon: Ticket, color: '#ec4899', tint: 'bg-pink-100 text-pink-700' },
  Miscellaneous: { icon: Package, color: '#64748b', tint: 'bg-slate-200 text-slate-700' },
};
