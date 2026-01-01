'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuPageClient from '@/components/MenuPageClient';

function MenuPageContent({ locale }: { locale: string }) {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug') || '';
    const table = searchParams.get('table') || undefined;

    return <MenuPageClient params={{ locale, slug, table }} />;
}

export default function MenuPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-restqr-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MenuPageContent locale={locale} />
        </Suspense>
    );
}
