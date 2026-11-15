import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { FormField, TextInput } from '@/components/ui/FormField';
import { signIn } from '@/services/authService';
import { getErrorMessage } from '@/utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see your spending, budgets and monthly balance.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password}>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
        <p className="text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
