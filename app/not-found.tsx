'use client';

import { useEffect, useState } from 'react';

/**
 * Universal 404 Handler (app/not-found.tsx)
 * This becomes the 404.html for GitHub Pages.
 */
export default function NotFound() {
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || isRedirecting) return;

        const l = window.location;
        const isProd = l.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';

        // Loop protection
        if (l.search.includes('p=')) {
            console.error('[SPA] Loop detected. Stopping.');
            return;
        }

        setIsRedirecting(true);

        let path = l.pathname;
        if (isProd && path.indexOf(repoName) === 0) {
            path = path.substring(repoName.length);
        }
        if (!path.startsWith('/')) path = '/' + path;

        // Redirect to /tr/ where our Resolver is waiting
        const url = l.origin + repoName + '/tr/?p=' + encodeURIComponent(path) +
            (l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '') +
            l.hash;

        console.log('[404] Redirecting to resolver:', url);
        l.replace(url);
    }, [isRedirecting]);

    return (
        <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#10b981', fontSize: '2.5rem', marginBottom: '1rem' }}>RestQR</h1>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                </div>
                <p style={{ color: '#666' }}>Yükleniyor...</p>
                <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
            </div>
        </div>
    );
}
