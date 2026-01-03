'use client';

import { useEffect } from 'react';

/**
 * Universal 404 Responder (app/not-found.tsx)
 * 
 * Intercepts unknown paths on GitHub Pages and redirects to the localized resolver.
 */
export default function NotFound() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const l = window.location;
        const isProd = l.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';

        // 1. Get current path (removing repoName for prod)
        let path = l.pathname;
        if (isProd && path.indexOf(repoName) === 0) {
            path = path.substring(repoName.length);
        }
        if (!path.startsWith('/')) path = '/' + path;

        // 2. Determine locale
        const parts = path.split('/').filter(Boolean);
        const locale = ['tr', 'en'].includes(parts[0]) ? parts[0] : 'tr';

        // 3. Build redirect URL
        // We pass the deep path as 'p'
        const search = l.search ? (l.search.startsWith('?') ? l.search.slice(1) : l.search) : '';
        const recoveryUrl = l.origin + repoName + '/' + locale + '/?p=' + encodeURIComponent(path) + (search ? '&q=' + encodeURIComponent(search) : '') + l.hash;

        console.log('[SPA] Redirecting 404 -> ', recoveryUrl);
        l.replace(recoveryUrl);
    }, []);

    return (
        <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#10b981', fontSize: '2.5rem', marginBottom: '1rem' }}>RestQR</h1>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 2rem' }}></div>
                <p style={{ color: '#666' }}>Yükleniyor...</p>
                <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
            </div>
        </div>
    );
}
