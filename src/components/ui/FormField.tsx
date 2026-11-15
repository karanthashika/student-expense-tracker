import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}

export function FormField({ label, error, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT_CLASS} ${props.className ?? ''}`} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT_CLASS} ${props.className ?? ''}`} />;
}
