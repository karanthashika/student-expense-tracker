import type { ReactNode } from 'react';
import { GraduationCap, Wallet } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.pexels.com/photos/5900092/pexels-photo-5900092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="Student reviewing monthly expenses on a laptop"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500">
            <Wallet className="h-6 w-6" />
          </span>
          <h2 className="text-3xl font-semibold leading-tight">Every rupee accounted for.</h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-slate-200">
            Track mess bills, rent, books and travel in one place, stay inside your monthly allowance and export clean statements whenever you need them.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
            <GraduationCap className="h-4 w-4" />
            Built for student budgets
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="font-semibold text-slate-900">Student Expense Tracker</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
