'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * GHPageSPARecover
 * 
 * Final version with loop protection.
 */
export default function GHPageSPARecover() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPathname = usePathname();
    const hasRecovered = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || hasRecovered.current) return;

        const p = searchParams.get('p');
        const q = searchParams.get('q');

        if (p !== null) {
            hasRecovered.current = true;

            // 1. Decode target
            let targetPath = decodeURIComponent(p);
            if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

            if (q) {
                const decodedQuery = decodeURIComponent(q);
                targetPath += (targetPath.includes('?') ? '&' : '?') + decodedQuery.replace(/~and~/g, '&');
            }

            // 2. Prevent redundant navigation
            // targetPath is e.g. /tr/menu/...
            // currentPathname is e.g. /AdistowLite/ (at the root)

            console.log('[SPA] Recovery path:', targetPath);

            // 3. Clean Browser URL immediately
            const repoName = '/AdistowLite';
            const cleanUrl = window.location.origin + repoName + targetPath + window.location.hash;

            // We update the address bar BEFORE Calling router.replace
            // This ensures that if router.replace reloads, it hits the 404 again 
            // but Next.js internal state is updated.
            window.history.replaceState(null, '', cleanUrl);

            // 4. Trigger Next.js Routing
            // Because we have used a CATCH-ALL route, Next.js should match this
            // and perform a CLIENT-SIDE transition!
            router.replace(targetPath);
        }
    }, [router, searchParams, currentPathname]);

    return null;
}
