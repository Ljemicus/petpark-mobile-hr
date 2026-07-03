import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from './domain-types';
import { supabase } from './supabase';
import { captureAppError } from './sentry';
import type { Session } from '@supabase/supabase-js';

type OnboardingData = {
  petName?: string;
  petType?: string;
  petSize?: string;
  hasSpecialNeeds?: boolean | null;
  specialNeedsNote?: string;
  experience?: string;
  services?: string[];
  hasYard?: boolean | null;
  pricePerHour?: number;
  avatarUrl?: string;
  verificationStatus?: 'none' | 'pending';
  verificationNotes?: string;
  verificationDocuments?: string[];
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role?: User['role']) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: {
    fullName: string;
    role: 'vlasnik' | 'sitter';
    city: string;
    onboarding?: OnboardingData;
  }) => Promise<{ success: boolean; error?: string }>;
  skipOnboarding: () => void;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  loading: boolean;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  completeOnboarding: async () => ({ success: false, error: 'Onboarding nije spreman.' }),
  skipOnboarding: () => {},
  logout: async () => {},
  isLoggedIn: false,
  loading: true,
  needsOnboarding: false,
});

function sessionToUser(session: Session): User {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    name: meta.full_name ?? meta.name ?? session.user.email?.split('@')[0] ?? 'Korisnik',
    email: session.user.email ?? '',
    avatar: meta.avatar_url ?? meta.avatar ?? '👤',
    role: meta.role ?? 'vlasnik',
    city: meta.city ?? 'Zagreb',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Dohvati trenutnu sesiju
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        setUser(sessionToUser(s));
        const meta = s.user.user_metadata ?? {};
        setNeedsOnboarding(!meta.onboarding_completed);
      } else {
        setNeedsOnboarding(false);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Slušaj promjene auth stanja
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s ? sessionToUser(s) : null);
      const meta = s?.user.user_metadata ?? {};
      setNeedsOnboarding(!!s && !meta.onboarding_completed);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Prijava nije uspjela.' };
    }
  };

  const register = async (email: string, password: string, name: string, role: User['role'] = 'vlasnik'): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role } },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Registracija nije uspjela.' };
    }
  };

  const completeOnboarding = async (data: {
    fullName: string;
    role: 'vlasnik' | 'sitter';
    city: string;
    onboarding?: OnboardingData;
  }): Promise<{ success: boolean; error?: string }> => {
    const onboarding = data.onboarding ?? {};
    const avatar = onboarding.avatarUrl ?? (data.role === 'sitter' ? '🤝' : '🐾');

    if (!session?.user?.id) {
      return { success: false, error: 'Nema aktivne sesije. Prijavi se pa pokušaj ponovno.' };
    }

    try {
      const userId = session.user.id;

      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          role: data.role,
          city: data.city,
          onboarding,
          onboarding_completed: true,
          avatar,
          avatar_url: onboarding.avatarUrl ?? null,
          verification_status: onboarding.verificationStatus ?? 'none',
        },
      });
      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: session.user.email ?? '',
          display_name: data.fullName,
          city: data.city,
          avatar_url: onboarding.avatarUrl ?? null,
          onboarding_state: 'completed',
        }, { onConflict: 'id' });
      if (profileError) throw profileError;

      if (data.role === 'sitter') {
        const { error: providerError } = await supabase
          .from('providers')
          .upsert({
            profile_id: userId,
            provider_kind: 'sitter',
            display_name: data.fullName,
            city: data.city,
            bio: onboarding.experience ?? '',
            public_status: 'draft',
            verified_status: onboarding.verificationStatus ?? 'none',
          }, { onConflict: 'profile_id,provider_kind' });
        if (providerError) throw providerError;
      }

      setUser((prev) => ({
        id: prev?.id ?? userId,
        name: data.fullName,
        email: prev?.email ?? session.user.email ?? '',
        avatar,
        role: data.role,
        city: data.city,
      }));
      setNeedsOnboarding(false);

      return { success: true };
    } catch (err: any) {
      captureAppError('auth.completeOnboarding', err, { role: data.role, city: data.city });
      const internalMessage = err?.message ?? String(err ?? 'unknown');
      console.warn('completeOnboarding: Supabase save failed:', internalMessage);
      return { success: false, error: 'Spremanje nije uspjelo. Provjeri vezu i pokušaj ponovno.' };
    }
  };

  const skipOnboarding = () => {
    setNeedsOnboarding(false);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignoriraj
    }
    setUser(null);
    setSession(null);
    setNeedsOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, completeOnboarding, skipOnboarding, logout, isLoggedIn: !!user, loading, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
