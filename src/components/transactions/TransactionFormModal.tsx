import { useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, SelectInput, TextInput } from '@/components/ui/FormField';
import { EXPENSE_CATEGORIES, INCOME_CATEGORY, PAYMENT_MODES, type ExpenseCategory, type PaymentMode, type TransactionType } from '@/constants/finance';
import type { Transaction, TransactionInput } from '@/types/finance';
import { getErrorMessage, toDateKey } from '@/utils/format';

const MAX_AMOUNT = 10000000;
const MAX_NOTE_LENGTH = 200;

interface TransactionFormModalProps {
  initial: Transaction | null;
  onSave: (input: TransactionInput) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  type: TransactionType;
  amount: string;
  category: ExpenseCategory;
  paymentMode: PaymentMode;
  txnDate: string;
  note: string;
}

type FormErrors = Partial<Record<'amount' | 'txnDate' | 'note', string>>;

const buildInitialState = (initial: Transaction | null): FormState => ({
  type: initial?.type ?? 'expense',
  amount: initial ? String(initial.amount) : '',
  category: initial && initial.category !== INCOME_CATEGORY ? initial.category : 'Food/Mess',
  paymentMode: initial?.payment_mode ?? 'UPI',
  txnDate: initial?.txn_date ?? toDateKey(new Date()),
  note: initial?.note ?? '',
});

export function TransactionFormModal({ initial, onSave, onClose }: TransactionFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = initial !== null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const amount = Number(form.amount);
    if (form.amount === '' || !Number.isFinite(amount) || amount <= 0) {
      next.amount = 'Enter an amount greater than zero.';
    } else if (amount > MAX_AMOUNT) {
      next.amount = 'Amount cannot exceed 1,00,00,000.';
    }
    if (!form.txnDate || form.txnDate > toDateKey(new Date())) next.txnDate = 'Choose today or an earlier date.';
    if (form.note.length > MAX_NOTE_LENGTH) next.note = `Keep notes under ${MAX_NOTE_LENGTH} characters.`;
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const isIncome = form.type === 'income';
    setSubmitting(true);
    try {
      await onSave({
        type: form.type,
        amount: Math.round(Number(form.amount) * 100) / 100,
        category: isIncome ? INCOME_CATEGORY : form.category,
        payment_mode: form.paymentMode,
        note: form.note.trim(),
        txn_date: form.txnDate,
      });
    } catch (err) {
      setFormError(getErrorMessage(err, 'We could not save this transaction. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <Modal open title={isEditing ? 'Edit transaction' : 'Add transaction'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Transaction type">
          {(
            [
              { value: 'expense', label: 'Expense', icon: ArrowUpRight },
              { value: 'income', label: 'Income', icon: ArrowDownLeft },
            ] as const
          ).map((option) => {
            const active = form.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update('type', option.value)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all duration-150 ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        <FormField label="Amount (INR)" htmlFor="txn-amount" error={errors.amount}>
          <TextInput
            id="txn-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Category" htmlFor="txn-category">
            <SelectInput
              id="txn-category"
              value={form.type === 'income' ? INCOME_CATEGORY : form.category}
              disabled={form.type === 'income'}
              onChange={(e) => update('category', e.target.value as ExpenseCategory)}
            >
              {form.type === 'income' ? (
                <option value={INCOME_CATEGORY}>{INCOME_CATEGORY}</option>
              ) : (
                EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              )}
            </SelectInput>
          </FormField>
          <FormField label="Payment mode" htmlFor="txn-mode">
            <SelectInput
              id="txn-mode"
              value={form.paymentMode}
              onChange={(e) => update('paymentMode', e.target.value as PaymentMode)}
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Date" htmlFor="txn-date" error={errors.txnDate}>
          <TextInput
            id="txn-date"
            type="date"
            max={toDateKey(new Date())}
            value={form.txnDate}
            onChange={(e) => update('txnDate', e.target.value)}
          />
        </FormField>

        <FormField label="Note (optional)" htmlFor="txn-note" error={errors.note} hint={`${form.note.length}/${MAX_NOTE_LENGTH}`}>
          <TextInput
            id="txn-note"
            placeholder="e.g. Canteen lunch with friends"
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Save changes' : 'Add transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
