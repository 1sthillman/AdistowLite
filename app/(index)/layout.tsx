import { Suspense } from 'react';
import GHPageSPARecover from '@/components/GHPageSPARecover';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body className="bg-[#0A0A0A]">
                <Suspense fallback={null}>
                    <GHPageSPARecover />
                </Suspense>
                {children}
            </body>
        </html>
    );
}
