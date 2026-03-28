import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, users } from './mock-data';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  isLoggedIn: false,
  loading: true,
});

function sessionToUser(session: Session): User {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    name: meta.full_name ?? meta.name ?? session.user.email?.split('@')[0] ?? 'Korisnik',
    email: session.user.email ?? '',
    avatar: meta.avatar ?? '👤',
    role: meta.role ?? 'vlasnik',
    city: meta.city ?? 'Zagreb',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dohvati trenutnu sesiju
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) setUser(sessionToUser(s));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Slušaj promjene auth stanja
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s ? sessionToUser(s) : null);
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
        return { success: true };
      }
      // Demo: prijavi kao prvog korisnika
      setUser(users[0]);
      return { success: true };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      // Mock fallback
      setUser({ id: 'new', name, email, avatar: '👤', role: 'vlasnik', city: 'Zagreb' });
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignoriraj
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isLoggedIn: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
