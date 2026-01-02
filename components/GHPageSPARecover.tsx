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
            // Decode the path
            let targetPath = decodeURIComponent(p);
            if (!targetPath.startsWith('/')) {
                targetPath = '/' + targetPath;
            }

            // Decode and append original query params if they exist
            if (q) {
                const decodedQuery = decodeURIComponent(q);
                targetPath += (targetPath.includes('?') ? '&' : '?') + decodedQuery.replace(/~and~/g, '&');
            }

            console.log('[SPA Recover] Target Path:', targetPath);

            // 1. Tell Next.js router to go to the real path
            router.replace(targetPath);

            // 2. Clean up the browser URL bar so the user doesn't see ?p=...
            const repoName = '/AdistowLite';
            // We want the browser bar to show: origin + repoName + targetPath
            const cleanUrl = window.location.origin + repoName + (targetPath.startsWith('/') ? targetPath : '/' + targetPath) + window.location.hash;

            window.history.replaceState(null, '', cleanUrl);
        }
    }, [router, searchParams]);

    return null;
}
