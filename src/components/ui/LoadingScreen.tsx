import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-label="Loading" />
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-teal-600" aria-label="Loading" />
    </div>
  );
}
