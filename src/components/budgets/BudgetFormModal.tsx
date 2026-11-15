import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, SelectInput, TextInput } from '@/components/ui/FormField';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/constants/finance';
import type { Budget } from '@/types/finance';
import { getErrorMessage } from '@/utils/format';

const MAX_LIMIT = 10000000;

interface BudgetFormModalProps {
  initial: Budget | null;
  availableCategories: ExpenseCategory[];
  onSave: (category: ExpenseCategory, monthlyLimit: number) => Promise<void>;
  onClose: () => void;
}

export function BudgetFormModal({ initial, availableCategories, onSave, onClose }: BudgetFormModalProps) {
  const isEditing = initial !== null;
  const categories = isEditing ? [initial.category] : availableCategories;
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? categories[0]);
  const [limit, setLimit] = useState(initial ? String(initial.monthly_limit) : '');
  const [limitError, setLimitError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(limit);
    if (limit === '' || !Number.isFinite(value) || value <= 0) {
      setLimitError('Enter a monthly limit greater than zero.');
      return;
    }
    if (value > MAX_LIMIT) {
      setLimitError('Limit cannot exceed 1,00,00,000.');
      return;
    }
    setLimitError(undefined);
    setFormError(null);
    setSubmitting(true);
    try {
      await onSave(category, Math.round(value * 100) / 100);
    } catch (err) {
      setFormError(getErrorMessage(err, 'We could not save this budget. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <Modal open title={isEditing ? 'Edit budget' : 'Set a budget'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}
        <FormField label="Category" htmlFor="budget-category" hint={isEditing ? undefined : 'Only categories without a budget are listed'}>
          <SelectInput
            id="budget-category"
            value={category}
            disabled={isEditing}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField
          label="Monthly limit (INR)"
          htmlFor="budget-limit"
          error={limitError}
          hint="You will be warned at 80% and alerted at 100%"
        >
          <TextInput
            id="budget-limit"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="e.g. 3000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </FormField>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Save changes' : 'Save budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
