'use client';

import { useEffect } from 'react';

/**
 * Custom 404 Page (not-found.tsx)
 * 
 * Next.js App Router for static export generates out/404.html from this file.
 * This file is critical for GitHub Pages SPA routing.
 * It detects the broken path and redirects to the root index.html with recovery params.
 */
export default function NotFound() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const l = window.location;
        const repoName = '/AdistowLite';
        let relativePath = l.pathname;

        // Clean up the path by removing the repository name prefix if present
        if (relativePath.startsWith(repoName)) {
            relativePath = relativePath.substring(repoName.length);
        }

        // Ensure path starts with a slash
        if (!relativePath.startsWith('/')) relativePath = '/' + relativePath;

        // Construct redirection URL to the root entry point
        // Using window.location.origin + repoName + / ensures we hit the index.html
        const redirectUrl = l.origin + repoName + '/?p=' + encodeURIComponent(relativePath) +
            (l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '') +
            l.hash;

        console.log('[404 Redirect] Navigating to:', redirectUrl);
        l.replace(redirectUrl);
    }, []);

    return (
        <div style={{
            background: '#0A0A0A',
            color: 'white',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
        }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#D97706' }}>RestQR</h1>
                <p style={{ color: '#666' }}>Menü Yükleniyor...</p>
                <div style={{
                    marginTop: '2rem',
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(217, 119, 6, 0.1)',
                    borderTopColor: '#D97706',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                }}></div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}} />
            </div>
        </div>
    );
}
