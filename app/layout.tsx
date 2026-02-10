import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ConnectionStatusBar } from '@/components/shared/ConnectionStatusBar';
import { BottomNav } from '@/components/shared/BottomNav';
import { ThemeInitializer } from '@/components/shared/ThemeInitializer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Live Match Center - Real-time Football Updates',
  description: 'Track live football matches with real-time scores, events, statistics, and chat.',
  keywords: ['football', 'live scores', 'match center', 'real-time', 'soccer'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeInitializer />
        <ConnectionStatusBar />
        <main className="pb-14 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
