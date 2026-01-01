import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['tr', 'en'];

export default getRequestConfig(async ({ locale }) => {
    // For static generation, locale comes from generateStaticParams
    // No need to use requestLocale() which causes headers() usage

    // Basic validation
    const validLocale = locale && locales.includes(locale as any) ? locale : 'tr';

    return {
        messages: (await import(`../messages/${validLocale}.json`)).default
    };
});
