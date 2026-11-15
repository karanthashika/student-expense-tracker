import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, PiggyBank, Receipt, UserRound, Wallet, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt, end: false },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setMenuOpen(false);
    }
  };

  const brand = (
    <div className="flex items-center gap-2 px-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
        <Wallet className="h-5 w-5" />
      </span>
      <span className="text-base font-semibold text-slate-900">Student Expense Tracker</span>
    </div>
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setMenuOpen(false)}>
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-200 pt-4">
      <p className="truncate px-3 text-xs text-slate-500" title={user?.email ?? ''}>
        {user?.email}
      </p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="flex flex-col gap-8">
          {brand}
          {nav}
        </div>
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 top-[57px] z-20 flex flex-col justify-between bg-white p-4 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
