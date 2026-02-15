'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/Logo';

type Mode = 'login' | 'register' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/');
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Parolele nu coincid');
          setLoading(false);
          return;
        }
        if (displayName.length < 2) {
          setError('Numele trebuie sa aiba cel putin 2 caractere');
          setLoading(false);
          return;
        }
        const result = await register({ email, password, displayName });
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/');
        }
      } else {
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error);
        } else {
          setResetSent(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setResetSent(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'login' && 'Conecteaza-te la contul tau'}
            {mode === 'register' && 'Creeaza un cont nou'}
            {mode === 'reset' && 'Reseteaza parola'}
          </p>
        </div>

        {/* Reset sent confirmation */}
        {resetSent && (
          <div className="bg-brand-orange-50 border border-brand-orange-200 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl block mb-2">{'\u{2709}'}</span>
            <p className="text-sm text-brand-orange-800 font-medium">Email trimis!</p>
            <p className="text-xs text-brand-orange-500 mt-1">
              Verifica inbox-ul pentru linkul de resetare a parolei.
            </p>
            <button
              onClick={() => switchMode('login')}
              className="text-sm text-brand-orange-600 font-medium mt-3 hover:underline"
            >
              Inapoi la login
            </button>
          </div>
        )}

        {!resetSent && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Social auth */}
            {mode !== 'reset' && (
              <>
                <div className="space-y-3 mb-6">
                  <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continua cu Google
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Continua cu GitHub
                  </button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-400">sau cu email</span>
                  </div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nume complet</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ion Popescu"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Parola</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Minim 6 caractere' : 'Parola ta'}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Confirma parola</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeta parola"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-xs text-brand-orange-500 hover:text-brand-orange-600"
                  >
                    Ai uitat parola?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se proceseaza...
                  </span>
                ) : (
                  <>
                    {mode === 'login' && 'Conecteaza-te'}
                    {mode === 'register' && 'Creeaza cont'}
                    {mode === 'reset' && 'Trimite link de resetare'}
                  </>
                )}
              </button>
            </form>

            {/* Mode switch */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === 'login' && (
                <>
                  Nu ai cont?{' '}
                  <button onClick={() => switchMode('register')} className="text-brand-orange-500 font-medium hover:underline">
                    Inregistreaza-te
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  Ai deja cont?{' '}
                  <button onClick={() => switchMode('login')} className="text-brand-orange-500 font-medium hover:underline">
                    Conecteaza-te
                  </button>
                </>
              )}
              {mode === 'reset' && (
                <button onClick={() => switchMode('login')} className="text-brand-orange-500 font-medium hover:underline">
                  Inapoi la login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Terms */}
        {mode === 'register' && (
          <p className="text-[11px] text-gray-400 text-center mt-4">
            Prin crearea contului, esti de acord cu{' '}
            <Link href="/termeni" className="underline hover:text-gray-600">Termenii si Conditiile</Link> si{' '}
            <Link href="/confidentialitate" className="underline hover:text-gray-600">Politica de Confidentialitate</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
