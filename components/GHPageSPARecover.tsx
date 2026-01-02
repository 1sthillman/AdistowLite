'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * GHPageSPARecover
 * 
 * Final, hardened version of the SPA recovery logic.
 */
export default function GHPageSPARecover() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasRecovered = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || hasRecovered.current) return;

        const p = searchParams.get('p');
        const q = searchParams.get('q');

        if (p !== null) {
            hasRecovered.current = true;

            // Decode the path
            let targetPath = decodeURIComponent(p);
            if (!targetPath.startsWith('/')) {
                targetPath = '/' + targetPath;
            }

            // Append query params
            if (q) {
                const decodedQuery = decodeURIComponent(q);
                const connector = targetPath.includes('?') ? '&' : '?';
                targetPath += connector + decodedQuery.replace(/~and~/g, '&');
            }

            console.log('[SPA] Recovery path found:', targetPath);

            // 1. Initial cleanup of browser history to prevent back-button loops
            const repoName = '/AdistowLite';
            const cleanUrl = window.location.origin + repoName + (targetPath.startsWith('/') ? targetPath : '/' + targetPath) + window.location.hash;
            window.history.replaceState(null, '', cleanUrl);

            // 2. Trigger Next.js internal transition
            // We use targetPath (which is relative to basePath if Next.js handles it, 
            // or absolute if we need to).
            router.replace(targetPath);

            console.log('[SPA] Router.replace called with:', targetPath);
        }
    }, [router, searchParams]);

    return null;
}
