import "../globals.css";
import { Toaster } from 'react-hot-toast';
import { Viewport } from 'next';
import BackgroundBokeh from '@/components/BackgroundBokeh';
import { CartProvider } from '@/context/CartContext';

// Standard font stacks to avoid build-time fetch errors in CI
const inter = { variable: '--font-inter' };
const playfair = { variable: '--font-playfair' };
const jetbrains = { variable: '--font-mono' };

export function generateStaticParams() {
  return [{ locale: 'tr' }, { locale: 'en' }];
}

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'RestQR - Premium Menu',
  description: 'Experience the future of dining',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RestQR',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  formatDetection: {
    telephone: false,
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased text-[#FAF7F2] min-h-screen selection:bg-[#D97706]/30 selection:text-white overflow-x-hidden`}>

        {/* Suppress Noisy Extension Errors (MetaMask, Grammarly, etc) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const suppressedErrors = [
                  'MetaMask', 
                  'ethereum', 
                  'inpage.js', 
                  'Grammarly', 
                  'extension', 
                  'Could not establish connection', 
                  'Receiving end does not exist'
                ];
                const isSuppressed = (m) => m && suppressedErrors.some(s => m.toString().toLowerCase().includes(s.toLowerCase()));

                window.addEventListener('error', (e) => {
                  if (isSuppressed(e.message) || isSuppressed(e.filename)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    console.warn('[UI Warning - Suppressed Extension Error]:', e.message);
                  }
                }, true);

                window.addEventListener('unhandledrejection', (e) => {
                  const reason = (e.reason && (e.reason.message || e.reason)) || '';
                  if (isSuppressed(reason)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    console.warn('[UI Warning - Suppressed Extension Rejection]:', reason);
                  }
                }, true);
              })();
            `
          }}
        />

        {/* Animated Bokeh & Glass Background */}
        <BackgroundBokeh />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <main className="relative z-10 min-h-screen flex flex-col">
              {children}
            </main>

            <Toaster
              position="top-center"
              toastOptions={{
                className: 'font-sans font-medium',
                style: {
                  background: '#1A1A1A',
                  color: '#FAF7F2',
                  border: '1px solid rgba(250, 247, 242, 0.1)',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  iconTheme: {
                    primary: '#D97706',
                    secondary: '#FAF7F2',
                  },
                },
              }}
            />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}