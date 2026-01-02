import MenuPageClient from '@/components/MenuPageClient';
import { unstable_setRequestLocale } from 'next-intl/server';

/**
 * Menu Catch-all Route (app/[locale]/menu/[...path]/page.tsx)
 * 
 * This catches both:
 * 1. /menu/[slug] -> path = ["slug"]
 * 2. /menu/[slug]/[tableId] -> path = ["slug", "tableId"]
 * 
 * Using a catch-all ensuring that the client-side router matches any subpath
 * even if it wasn't pre-rendered at build time.
 */

export function generateStaticParams() {
    return [
        { locale: 'tr', path: ['demo'] },
        { locale: 'en', path: ['demo'] },
        { locale: 'tr', path: ['demo', '1'] },
        { locale: 'en', path: ['demo', '1'] },
    ];
}

interface PageProps {
    params: {
        locale: string;
        path: string[];
    };
}

export default function Page({ params }: PageProps) {
    unstable_setRequestLocale(params.locale);

    const slug = params.path[0] || 'demo';
    const tableId = params.path[1]; // Might be undefined if url is just /menu/slug

    return (
        <MenuPageClient
            params={{
                locale: params.locale,
                slug: slug,
                table: tableId
            }}
        />
    );
}
