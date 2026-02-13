'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('refind_user') : null;
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API call
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
    setState({ user, isLoading: false, isAuthenticated: true });
    return {};
  }, []);

  const register = useCallback(async (data: { email: string; password: string; displayName: string }) => {
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
    setState({ user, isLoading: false, isAuthenticated: true });
    return {};
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('refind_user');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
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
