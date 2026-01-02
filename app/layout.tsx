import { Suspense } from 'react';
import GHPageSPARecover from '@/components/GHPageSPARecover';
import './globals.css';

// Font variable placeholders for consistency across layouts
const inter = { variable: '--font-inter' };
const playfair = { variable: '--font-playfair' };
const jetbrains = { variable: '--font-mono' };

/**
 * RootLayout (app/layout.tsx)
 * 
 * The ultimate root for GitHub Pages SPA.
 */
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        var l = window.location;
                        if (l.search.indexOf('p=%2F') !== -1) {
                            console.log('[SPA] Recovery mode active.');
                        }
                    })();
                `}} />
            </head>
            <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans bg-[#0A0A0A] text-[#FAF7F2] antialiased selection:bg-[#D97706]/30 selection:text-white overflow-x-hidden`}>
                <Suspense fallback={null}>
                    <GHPageSPARecover />
                </Suspense>
                {children}
            </body>
        </html>
    );
}
