import MenuPageClient from '@/components/MenuPageClient';
import { unstable_setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  // Static Export requires all dynamic paths to be known at build time.
  // We provide a 'demo' path as a fallback. 
  // For other restaurants, GitHub Pages will use the same JS shell if configured as an SPA.
  return [
    { locale: 'tr', slug: 'demo' },
    { locale: 'en', slug: 'demo' },
  ];
}

interface PageProps {
  params: {
    locale: string;
    slug: string;
    table?: string;
  };
}

export default function Page({ params }: PageProps) {
  unstable_setRequestLocale(params.locale);
  return <MenuPageClient params={params} />;
}