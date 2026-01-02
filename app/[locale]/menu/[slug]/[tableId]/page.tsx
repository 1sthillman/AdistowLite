import MenuPageClient from '@/components/MenuPageClient';
import { unstable_setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
    return [
        { locale: 'tr', slug: 'demo', tableId: '1' },
        { locale: 'en', slug: 'demo', tableId: '1' },
    ];
}

interface PageProps {
    params: {
        locale: string;
        slug: string;
        tableId: string;
    };
}

export default function Page({ params }: PageProps) {
    unstable_setRequestLocale(params.locale);
    // Pass tableId as 'table' to MenuPageClient to maintain compatibility with existing logic
    return <MenuPageClient params={{ ...params, table: params.tableId }} />;
}
