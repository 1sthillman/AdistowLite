import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { Viewport } from 'next';
import BackgroundBokeh from '@/components/BackgroundBokeh';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

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

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased text-[#FAF7F2] min-h-screen selection:bg-[#D97706]/30 selection:text-white overflow-x-hidden`}>

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