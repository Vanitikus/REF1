import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NavShell } from '@/components/NavShell';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'REFiND - The Waze of Lost & Found',
  description: 'Platforma civica pentru postarea, descoperirea si recuperarea obiectelor pierdute sau gasite.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REFiND',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: 'REFiND',
    title: 'REFiND - The Waze of Lost & Found',
    description: 'Platforma civica pentru recuperarea obiectelor pierdute si gasite.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <NavShell>{children}</NavShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
