import type { Metadata } from 'next';
import './globals.css';
import { NavShell } from '@/components/NavShell';

export const metadata: Metadata = {
  title: 'REFiND - The Waze of Lost & Found',
  description: 'Platforma civica pentru postarea, descoperirea si recuperarea obiectelor pierdute sau gasite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
