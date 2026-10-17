import '@/styles/globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist } from 'next/font/google';

import { UserMenu } from '@/app/_components/user-menu';
import { LanguageProvider } from '@/components/language-provider';
import { LanguageToggle } from '@/components/language-toggle';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TRPCReactProvider } from '@/trpc/react';

export const metadata: Metadata = {
  title: "Denoise It — Strip the noise. See what's real.",
  description:
    'Denoise It is a tool that helps extracting maximum signal out of noise from concepts, news, and other sources.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  twitter: {
    card: 'summary_large_image',
  },
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <LanguageProvider>
              <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <UserMenu />
                <LanguageToggle />
                <ModeToggle />
              </div>
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </LanguageProvider>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
