'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * GHPageSPARecover
 * 
 * GitHub Pages does not support SPA routing natively.
 * We use 404.html to redirect all unknown routes to index.html with a ?p= query param.
 * This component reads that param and programmatically updates the Next.js router
 * to ensure the correct dynamic page is loaded without a hard refresh.
 */
export default function GHPageSPARecover() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const p = searchParams.get('p');
        const q = searchParams.get('q');

        if (p !== null) {
            // Construct the real path
            // Normalizing path to avoid double slashes and ensure it starts with /
            let targetPath = p;
            if (!targetPath.startsWith('/')) {
                targetPath = '/' + targetPath;
            }

            // Append original query params if they exist
            if (q) {
                targetPath += '?' + q.replace(/~and~/g, '&');
            }

            console.log('[SPA Recover] Redirecting to:', targetPath);

            // Use router.replace to update Next.js internal state
            // and window.history.replaceState to clean up the URL for the user
            router.replace(targetPath);

            // Clean up the URL by removing the 404 params
            const cleanUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + targetPath + window.location.hash;
            window.history.replaceState(null, '', cleanUrl);
        }
    }, [router, searchParams]);

    return null;
}
