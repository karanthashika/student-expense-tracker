import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { FormField, SelectInput, TextInput } from '@/components/ui/FormField';
import { signUp } from '@/services/authService';
import { getErrorMessage } from '@/utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'monthlyAllowance';

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  monthlyAllowance: string;
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  monthlyAllowance: '',
};

const validate = (form: FormState): Partial<Record<FieldName, string>> => {
  const errors: Partial<Record<FieldName, string>> = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (form.password.length < 6) errors.password = 'Use at least 6 characters.';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
  const allowance = Number(form.monthlyAllowance);
  if (form.monthlyAllowance === '' || !Number.isFinite(allowance) || allowance < 0 || allowance > 10000000) {
    errors.monthlyAllowance = 'Enter a monthly allowance between 0 and 1,00,00,000.';
  }
  return errors;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        monthlyAllowance: Number(form.monthlyAllowance),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'We could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set your monthly allowance once and the dashboard will show how much you have left each month."
    >
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {formError && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">
            {formError}
          </div>
        )}
        <div className="sm:col-span-2">
          <FormField label="Full name" htmlFor="fullName" error={errors.fullName}>
            <TextInput
              id="fullName"
              autoComplete="name"
              placeholder="Aarav Sharma"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Password" htmlFor="password" error={errors.password} hint="At least 6 characters">
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <TextInput
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField
            label="Monthly allowance (INR)"
            htmlFor="monthlyAllowance"
            error={errors.monthlyAllowance}
            hint="Pocket money or stipend you receive each month"
          >
            <TextInput
              id="monthlyAllowance"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="e.g. 12000"
              value={form.monthlyAllowance}
              onChange={(e) => updateField('monthlyAllowance', e.target.value)}
            />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" loading={submitting} className="w-full">
            Create account
          </Button>
          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
