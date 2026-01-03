'use client';

import { useEffect } from 'react';

/**
 * Root Redirector (app/page.tsx)
 * 
 * Ensures that any landing on the bare domain is sent to the default locale
 * while preserving ALL parameters (p, q, etc.) and hashes.
 */
export default function RootPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const l = window.location;
    const search = l.search;
    const hash = l.hash;

    // Redirect to default Turkish locale
    const newUrl = l.origin + (l.pathname.endsWith('/') ? l.pathname : l.pathname + '/') + 'tr/' + search + hash;

    console.log('[Root] Redirecting to localized:', newUrl);
    l.replace(newUrl);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
}