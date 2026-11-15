import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, TextInput } from '@/components/ui/FormField';
import { InlineLoader } from '@/components/ui/LoadingScreen';
import { upsertProfile } from '@/services/profileService';
import type { Profile } from '@/types/finance';
import { formatCurrency, getErrorMessage } from '@/utils/format';

const MAX_ALLOWANCE = 10000000;

interface ProfileFormProps {
  userId: string;
  email: string;
  profile: Profile | null;
  onSaved: () => Promise<void>;
}

function ProfileForm({ userId, email, profile, onSaved }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [allowance, setAllowance] = useState(profile ? String(profile.monthly_allowance) : '');
  const [errors, setErrors] = useState<{ fullName?: string; allowance?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const value = Number(allowance);
    if (fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.';
    if (allowance === '' || !Number.isFinite(value) || value < 0) {
      nextErrors.allowance = 'Enter an allowance of zero or more.';
    } else if (value > MAX_ALLOWANCE) {
      nextErrors.allowance = 'Allowance cannot exceed 1,00,00,000.';
    }
    setErrors(nextErrors);
    setFormError(null);
    setSaved(false);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await upsertProfile(userId, {
        full_name: fullName.trim(),
        monthly_allowance: Math.round(value * 100) / 100,
      });
      await onSaved();
      setSaved(true);
    } catch (err) {
      setFormError(getErrorMessage(err, 'We could not save your profile. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      )}
      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Your profile has been saved.
        </div>
      )}
      <FormField label="Full name" htmlFor="profile-name" error={errors.fullName}>
        <TextInput id="profile-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormField>
      <FormField label="Email" htmlFor="profile-email" hint="Your sign-in email cannot be changed here">
        <TextInput id="profile-email" value={email} disabled readOnly />
      </FormField>
      <FormField
        label="Monthly allowance (INR)"
        htmlFor="profile-allowance"
        error={errors.allowance}
        hint="Used as the starting point for your remaining balance each month"
      >
        <TextInput
          id="profile-allowance"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={allowance}
          onChange={(e) => setAllowance(e.target.value)}
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error, reload } = useFinanceData();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm font-medium text-teal-700">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your profile</h1>
        <p className="mt-2 text-sm text-slate-600">Keep your allowance up to date so your dashboard reflects what you actually have.</p>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && !profile && !error ? (
        <InlineLoader />
      ) : user ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Personal details" description="Your name and monthly allowance" className="lg:col-span-2">
            <ProfileForm
              key={profile?.user_id ?? 'new-profile'}
              userId={user.id}
              email={user.email ?? ''}
              profile={profile}
              onSaved={reload}
            />
          </Card>
          <Card title="Current allowance" description="Pulled into your dashboard">
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {formatCurrency(profile?.monthly_allowance ?? 0)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Your remaining balance adds this allowance and any income you record, then subtracts what you have spent this month.
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
