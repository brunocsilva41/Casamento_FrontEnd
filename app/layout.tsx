import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { GiftProvider } from '@/lib/contexts/gift-context';
import { ThemeProvider } from '@/lib/theme-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bruno & Laura - Lista de Casamento',
  description: 'Lista de presentes de casamento do Bruno e Laura. Escolha um presente especial para o casal!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GiftProvider>
              <div className="min-h-screen bg-background">
                <Header />
                <main>{children}</main>
                <Toaster />
              </div>
            </GiftProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}