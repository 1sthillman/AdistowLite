'use client';

import { useEffect } from 'react';

/**
 * Universal 404 Responder (app/not-found.tsx)
 * 
 * This file is key to GitHub Pages SPA routing.
 * It catches every non-static path and sends it to the root resolver.
 */
export default function NotFound() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const l = window.location;
        const isProd = l.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';

        // 1. Extract path relative to repo root
        let path = l.pathname;
        if (isProd && path.indexOf(repoName) === 0) {
            path = path.substring(repoName.length);
        }
        if (!path.startsWith('/')) path = '/' + path;

        // 2. Identify target locale (default to tr)
        const parts = path.split('/').filter(Boolean);
        const locale = ['tr', 'en'].includes(parts[0]) ? parts[0] : 'tr';

        // 3. Construct Recovery URL
        // We use double-encoding for 'p' to ensure it passes cleanly through any intermediate redirects
        const search = l.search ? (l.search.startsWith('?') ? l.search.slice(1) : l.search) : '';
        const recoveryUrl = l.origin + repoName + '/' + locale + '/?' +
            'p=' + encodeURIComponent(path) +
            (search ? '&q=' + encodeURIComponent(search) : '') +
            l.hash;

        console.log('[404] Recovering to:', recoveryUrl);
        l.replace(recoveryUrl);
    }, []);

    return (
        <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#10b981', fontSize: '2.5rem', marginBottom: '1rem' }}>RestQR</h1>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 2rem' }}></div>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Yükleniyor...</p>
                <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
            </div>
        </div>
    );
}
