'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * GHPageSPARecover
 * 
 * Safely cleans the browser URL bar (?p=/menu/...) without triggering a Next.js 
 * navigation that might fail on GH Pages (static export).
 */
export default function GHPageSPARecover() {
    const searchParams = useSearchParams();
    const hasCleaned = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || hasCleaned.current) return;

        const p = searchParams.get('p');
        const q = searchParams.get('q');

        if (p !== null) {
            hasCleaned.current = true;

            // 1. Construct target display path
            let targetPath = decodeURIComponent(p);
            if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

            if (q) {
                const decodedQuery = decodeURIComponent(q);
                const connector = targetPath.includes('?') ? '&' : '?';
                targetPath += connector + decodedQuery.replace(/~and~/g, '&');
            }

            console.log('[SPA] Cleaning URL bar to:', targetPath);

            // 2. Clean Browser URL bar ONLY
            const isProd = window.location.hostname !== 'localhost';
            const repoName = isProd ? '/AdistowLite' : '';
            const cleanUrl = window.location.origin + repoName + targetPath + window.location.hash;

            // silent update - This keeps the pretty URL in the address bar 
            // but Next.js stays on the current (working) page.
            window.history.replaceState(null, '', cleanUrl);
        }
    }, [searchParams]);

    return null;
}
