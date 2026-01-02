'use client';

import { useEffect, useRef } from 'react';

export default function HomePage() {
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    const isProd = window.location.hostname !== 'localhost';
    const repoName = isProd ? '/AdistowLite' : '';
    const path = window.location.pathname;

    // Redirect root to /tr/ while preserving all search params (?p=...&q=...)
    // Root check: either exactly repoName, or repoName + /
    if (path === repoName || path === repoName + '/') {
      hasRedirected.current = true;

      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const nextUrl = repoName + '/tr/' + search + hash;

      console.log('[Root] Redirecting to localized entry:', nextUrl);
      window.location.replace(nextUrl);
    }
  }, []);

  return (
    <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '30px', height: '30px', border: '2px solid rgba(217, 119, 6, 0.2)', borderTopColor: '#D97706', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: '#444', fontSize: '0.9rem' }}>RestQR...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    </div>
  );
}