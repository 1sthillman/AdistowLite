'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    const path = window.location.pathname.replace(/\/$/, '');
    const repoName = '/AdistowLite';

    // Redirect root to /tr/ while preserving all search params (?p=...&q=...)
    if (path === '' || path === repoName || path === '/') {
      hasRedirected.current = true;
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      router.replace('/tr/' + search + hash);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">RestQR Yükleniyor...</p>
    </div>
  );
}