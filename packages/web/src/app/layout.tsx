import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NavShell } from '@/components/NavShell';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

export const viewport: Viewport = {
  themeColor: '#F2994A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ReFind - The Waze of Lost & Found',
  description: 'Platforma civica pentru postarea, descoperirea si recuperarea obiectelor pierdute sau gasite.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ReFind',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: 'ReFind',
    title: 'ReFind - The Waze of Lost & Found',
    description: 'Platforma civica pentru recuperarea obiectelor pierdute si gasite.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-refind-light text-refind-dark font-inter antialiased dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <NavShell>{children}</NavShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
