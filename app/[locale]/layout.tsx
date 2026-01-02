import { Toaster } from 'react-hot-toast';
import BackgroundBokeh from '@/components/BackgroundBokeh';
import { CartProvider } from '@/context/CartContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

/**
 * LocaleLayout (app/[locale]/layout.tsx)
 * 
 * Nested layout for localized paths.
 * Inherits the HTML shell from the root app/layout.tsx.
 */
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
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* SPA Routing Handlers (Pre-hydration Cleanup for flash prevention) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var l = window.location;
              if (l.search) {
                var q = {};
                l.search.slice(1).split('&').forEach(function(v) {
                  var a = v.split('=');
                  q[a[0]] = a.slice(1).join('=').replace(/~and~/g, '&');
                });
                if (q.p !== undefined) {
                  var path = q.p || '';
                  if (!path.startsWith('/')) path = '/' + path;
                  var newPath = l.pathname.replace(/index\\.html$/, '').replace(/\\/$/, '') + path + (q.q ? ('?' + q.q) : '') + l.hash;
                  window.history.replaceState(null, null, newPath.replace(/\\/+/g, '/'));
                }
              }

              // Suppress common extension errors that clutter the console
              const suppressed = ['MetaMask', 'ethereum', 'inpage.js', 'Grammarly', 'extension'];
              window.addEventListener('error', (e) => {
                const msg = (e.message || '').toLowerCase();
                if (suppressed.some(s => msg.includes(s.toLowerCase()))) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
            })();
          `
        }}
      />

      {/* Animated Bokeh Background */}
      <BackgroundBokeh />

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
  );
}

export function generateStaticParams() {
  return [{ locale: 'tr' }, { locale: 'en' }];
}