'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { isSupabaseConfigured, createClient } from './supabase';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarInitial: string;
  communityScore: number;
  isVerified: boolean;
  role: 'user' | 'moderator' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { email: string; password: string; displayName: string }) => Promise<{ error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo user for mock auth
const DEMO_USER: User = {
  id: 'demo-1',
  email: 'demo@refind.ro',
  displayName: 'Utilizator Demo',
  avatarInitial: 'U',
  communityScore: 145,
  isVerified: true,
  role: 'user',
};

const USE_SUPABASE = isSupabaseConfigured();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata;
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: meta?.display_name || session.user.email?.split('@')[0] || 'User',
            avatarInitial: (meta?.display_name || session.user.email || 'U')[0].toUpperCase(),
            communityScore: meta?.community_score || 0,
            isVerified: meta?.is_verified || false,
            role: meta?.role || 'user',
          };
          setState({ user, token: session.access_token, isLoading: false, isAuthenticated: true });
        } else {
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata;
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: meta?.display_name || session.user.email?.split('@')[0] || 'User',
            avatarInitial: (meta?.display_name || session.user.email || 'U')[0].toUpperCase(),
            communityScore: meta?.community_score || 0,
            isVerified: meta?.is_verified || false,
            role: meta?.role || 'user',
          };
          setState({ user, token: session.access_token, isLoading: false, isAuthenticated: true });
        } else {
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock mode: restore from localStorage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('refind_user') : null;
      if (stored) {
        try {
          const user = JSON.parse(stored) as User;
          setState({ user, token: 'mock-token', isLoading: false, isAuthenticated: true });
        } catch {
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    }

    // Mock mode
    await new Promise((r) => setTimeout(r, 800));
    if (password.length < 4) {
      return { error: 'Parola trebuie sa aiba cel putin 4 caractere' };
    }
    const user: User = {
      ...DEMO_USER,
      email,
      displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      avatarInitial: email[0].toUpperCase(),
    };
    localStorage.setItem('refind_user', JSON.stringify(user));
    setState({ user, token: 'mock-token', isLoading: false, isAuthenticated: true });
    return {};
  }, []);

  const register = useCallback(async (data: { email: string; password: string; displayName: string }) => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { display_name: data.displayName } },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Mock mode
    await new Promise((r) => setTimeout(r, 1000));
    if (data.password.length < 6) {
      return { error: 'Parola trebuie sa aiba cel putin 6 caractere' };
    }
    const user: User = {
      ...DEMO_USER,
      email: data.email,
      displayName: data.displayName,
      avatarInitial: data.displayName[0].toUpperCase(),
      isVerified: false,
      communityScore: 0,
    };
    localStorage.setItem('refind_user', JSON.stringify(user));
    setState({ user, token: 'mock-token', isLoading: false, isAuthenticated: true });
    return {};
  }, []);

  const logout = useCallback(() => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      supabase.auth.signOut();
    }
    localStorage.removeItem('refind_user');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    }
    await new Promise((r) => setTimeout(r, 800));
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
