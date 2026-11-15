import { FormField, SelectInput, TextInput } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { EXPENSE_CATEGORIES, INCOME_CATEGORY, PAYMENT_MODES } from '@/constants/finance';
import { DEFAULT_FILTERS, type TransactionFilterValues, type TypeFilter } from '@/utils/transactionFilters';

interface TransactionFiltersProps {
  values: TransactionFilterValues;
  onChange: (values: TransactionFilterValues) => void;
}

export function TransactionFilters({ values, onChange }: TransactionFiltersProps) {
  const set = <K extends keyof TransactionFilterValues>(key: K, value: TransactionFilterValues[K]) =>
    onChange({ ...values, [key]: value });

  const isDirty = JSON.stringify(values) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <FormField label="Type" htmlFor="filter-type">
        <SelectInput id="filter-type" value={values.type} onChange={(e) => set('type', e.target.value as TypeFilter)}>
          <option value="all">All</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </SelectInput>
      </FormField>
      <FormField label="Category" htmlFor="filter-category">
        <SelectInput id="filter-category" value={values.category} onChange={(e) => set('category', e.target.value)}>
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value={INCOME_CATEGORY}>{INCOME_CATEGORY}</option>
        </SelectInput>
      </FormField>
      <FormField label="Payment mode" htmlFor="filter-mode">
        <SelectInput id="filter-mode" value={values.paymentMode} onChange={(e) => set('paymentMode', e.target.value)}>
          <option value="all">All modes</option>
          {PAYMENT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </SelectInput>
      </FormField>
      <FormField label="From" htmlFor="filter-from">
        <TextInput id="filter-from" type="date" value={values.from} max={values.to || undefined} onChange={(e) => set('from', e.target.value)} />
      </FormField>
      <FormField label="To" htmlFor="filter-to">
        <TextInput id="filter-to" type="date" value={values.to} min={values.from || undefined} onChange={(e) => set('to', e.target.value)} />
      </FormField>
      <div className="flex items-end">
        <Button variant="secondary" className="w-full" onClick={() => onChange(DEFAULT_FILTERS)} disabled={!isDirty}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
