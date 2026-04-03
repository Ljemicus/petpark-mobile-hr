import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, users } from './mock-data';
import { supabase } from './supabase';
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
  }) => Promise<void>;
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
  completeOnboarding: async () => {},
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
      // Mock fallback
      const found = users.find((u) => u.email === email);
      if (found) {
        setUser(found);
        setNeedsOnboarding(false);
        return { success: true };
      }
      // Demo: prijavi kao prvog korisnika
      setUser(users[0]);
      setNeedsOnboarding(false);
      return { success: true };
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
      // Mock fallback
      setUser({ id: 'new', name, email, avatar: role === 'sitter' ? '🤝' : '🐾', role, city: 'Rijeka' });
      setNeedsOnboarding(true);
      return { success: true };
    }
  };

  const completeOnboarding = async (data: {
    fullName: string;
    role: 'vlasnik' | 'sitter';
    city: string;
    onboarding?: OnboardingData;
  }) => {
    const onboarding = data.onboarding ?? {};
    const avatar = onboarding.avatarUrl ?? (data.role === 'sitter' ? '🤝' : '🐾');

    try {
      if (session?.user?.id) {
        const userId = session.user.id;

        await supabase.auth.updateUser({
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

        await supabase
          .from('users')
          .upsert({
            id: userId,
            full_name: data.fullName,
            city: data.city,
            role: data.role,
            avatar: avatar,
            onboarding_completed: true,
          }, { onConflict: 'id' });

        if (data.role === 'sitter') {
          await supabase
            .from('sitter_profiles')
            .upsert({
              id: userId,
              bio: onboarding.experience ?? '',
              services: onboarding.services ?? [],
              price_per_hour: onboarding.pricePerHour ?? 0,
              avatar: avatar,
              verified: onboarding.verificationStatus === 'pending',
              has_yard: onboarding.hasYard ?? false,
              verification_status: onboarding.verificationStatus ?? 'none',
              verification_notes: onboarding.verificationNotes ?? null,
              verification_documents: onboarding.verificationDocuments ?? [],
            }, { onConflict: 'id' });
        }

        setNeedsOnboarding(false);
      }
    } catch {
      // fallback is local state below
    }

    setUser((prev) => ({
      id: prev?.id ?? session?.user?.id ?? 'new',
      name: data.fullName,
      email: prev?.email ?? session?.user?.email ?? '',
      avatar,
      role: data.role,
      city: data.city,
    }));
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
    <AuthContext.Provider value={{ user, session, login, register, completeOnboarding, logout, isLoggedIn: !!user, loading, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
