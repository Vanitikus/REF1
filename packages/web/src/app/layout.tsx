import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REFiND - The Waze of Lost & Found',
  description: 'Platforma civica pentru postarea, descoperirea si recuperarea obiectelor pierdute sau gasite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">&#x1F50D;</span>
          <span className="text-xl font-bold tracking-tight">
            RE<span className="text-emerald-600">Fi</span>ND
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2 w-80">
          <span className="text-gray-400 text-sm">&#x1F50E;</span>
          <input
            type="text"
            placeholder="Cauta obiecte pierdute..."
            className="bg-transparent outline-none text-sm flex-1 ml-2"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <span className="text-xl">&#x1F514;</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
      <div className="flex items-center justify-around h-16">
        <NavItem emoji="&#x1F3E0;" label="Feed" active />
        <NavItem emoji="&#x1F5FA;" label="Harta" />
        <AddButton />
        <NavItem emoji="&#x1F4AC;" label="Chat" />
        <NavItem emoji="&#x1F464;" label="Profil" />
      </div>
    </nav>
  );
}

function NavItem({ emoji, label, active }: { emoji: string; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-0.5 ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
      <span className="text-xl" dangerouslySetInnerHTML={{ __html: emoji }} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function AddButton() {
  return (
    <button className="w-14 h-14 -mt-5 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center text-2xl font-light hover:bg-emerald-700 transition-colors">
      +
    </button>
  );
}
