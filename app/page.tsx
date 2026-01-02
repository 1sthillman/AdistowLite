'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // If we're already handling a recovery, don't interfere
    if (searchParams.get('p') || hasRedirected.current) return;

    // Check if we are at the root
    if (window.location.pathname === '/' || window.location.pathname === '/AdistowLite' || window.location.pathname === '/AdistowLite/') {
      hasRedirected.current = true;
      router.replace('/tr');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">RestQR Yükleniyor...</p>
    </div>
  );
}