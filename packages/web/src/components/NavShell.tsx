'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Logo } from './Logo';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';

const NAV_ITEMS: { href: string; icon: string; label: string; isFab?: boolean }[] = [
  { href: '/', icon: '\u{1F3E0}', label: 'Feed' },
  { href: '/harta', icon: '\u{1F5FA}', label: 'Harta' },
  { href: '/posteaza', icon: '+', label: 'Posteaza', isFab: true },
  { href: '/chat', icon: '\u{1F4AC}', label: 'Chat' },
  { href: '/profil', icon: '\u{1F464}', label: 'Profil' },
];

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/autentificare';

  return (
    <>
      {!isAuthPage && <Header pathname={pathname} />}
      <main className={isAuthPage ? '' : 'max-w-6xl mx-auto px-4 pb-20'}>
        <PageTransition>{children}</PageTransition>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <BottomNav pathname={pathname} />}
    </>
  );
}

function Header({ pathname }: { pathname: string }) {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cauta?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/cauta');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Logo size="sm" />

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.filter((n) => !n.isFab).map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-brand-orange-50 text-brand-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2 w-64">
            <span className="text-gray-400 text-sm">{'\u{1F50E}'}</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cauta obiecte pierdute..."
              className="bg-transparent outline-none text-sm flex-1 ml-2"
            />
          </form>

          {/* Search icon (mobile) */}
          <Link href="/cauta" className="md:hidden p-2 text-gray-500 hover:text-gray-700">
            <span className="text-lg">{'\u{1F50E}'}</span>
          </Link>

          <Link
            href="/posteaza"
            className="hidden sm:flex items-center gap-1.5 bg-brand-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-orange-600 transition-colors"
          >
            + Posteaza
          </Link>

          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title={isDark ? 'Mod luminos' : 'Mod intunecat'}
          >
            <span className="text-lg">{isDark ? '\u{2600}' : '\u{1F319}'}</span>
          </button>

          <Link href="/notificari" className="relative p-2 text-gray-500 hover:text-gray-700">
            <span className="text-xl">{'\u{1F514}'}</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dot-pulse" />
          </Link>

          {isAuthenticated && user ? (
            <Link href="/profil">
              <div className="w-8 h-8 rounded-full bg-brand-teal-400 text-white flex items-center justify-center text-sm font-semibold">
                {user.avatarInitial}
              </div>
            </Link>
          ) : (
            <Link
              href="/autentificare"
              className="text-sm text-brand-orange-500 font-medium hover:text-brand-orange-600"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden animate-slide-up">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          if (item.isFab) {
            return (
              <Link key={item.href} href={item.href}>
                <div className="w-14 h-14 -mt-5 rounded-full bg-brand-orange-500 text-white shadow-lg flex items-center justify-center text-2xl font-light hover:bg-brand-orange-600 transition-colors">
                  +
                </div>
              </Link>
            );
          }
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 ${active ? 'text-brand-orange-500' : 'text-gray-400'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
