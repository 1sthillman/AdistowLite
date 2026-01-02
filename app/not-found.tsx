'use client';

import { useEffect } from 'react';

/**
 * Universal 404 Handler (app/not-found.tsx)
 * 
 * This is exported as 404.html.
 * It is the absolute first responder for any unknown path on GitHub Pages.
 */
export default function NotFound() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const l = window.location;
        const repoName = '/AdistowLite';

        let path = l.pathname;
        if (path.indexOf(repoName) === 0) {
            path = path.substring(repoName.length);
        }
        if (!path.startsWith('/')) path = '/' + path;

        // Redirect to the language-safe root (tr is default)
        // We go to /tr/ because we know it exists as a static folder.
        const url = l.origin + repoName + '/tr/?p=' + encodeURIComponent(path) +
            (l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '') +
            l.hash;

        l.replace(url);
    }, []);

    return (
        <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#D97706' }}>RestQR</h1>
                <p>Yükleniyor...</p>
            </div>
        </div>
    );
}
