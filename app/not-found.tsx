'use client';

import { useEffect } from 'react';

/**
 * Universal 404 Handler (app/not-found.tsx)
 */
export default function NotFound() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const l = window.location;
        const isProd = l.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';

        // LOOP PROTECTION
        if (l.search.includes('p=')) {
            console.error('[SPA Loop Protection] Hit 404 during recovery. Stopping.');
            return;
        }

        let path = l.pathname;
        if (isProd && path.indexOf(repoName) === 0) {
            path = path.substring(repoName.length);
        }
        if (!path.startsWith('/')) path = '/' + path;

        // Redirect to localized root
        const url = l.origin + repoName + '/tr/?p=' + encodeURIComponent(path) +
            (l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '') +
            l.hash;

        console.log('[404] Initiating recovery to:', url);
        l.replace(url);
    }, []);

    return (
        <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h1 style={{ color: '#D97706', fontSize: '2rem', marginBottom: '1rem' }}>RestQR</h1>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(217, 119, 6, 0.2)', borderTopColor: '#D97706', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                </div>
                <p style={{ color: '#666' }}>Yükleniyor...</p>
                <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
            </div>
        </div>
    );
}
