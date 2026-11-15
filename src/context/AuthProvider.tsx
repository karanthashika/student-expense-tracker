import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signOut as signOutRequest } from '@/services/authService';
import { AuthContext } from '@/context/auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        if (active) setSession(nextSession);
      })();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut: signOutRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
