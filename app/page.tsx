'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If we have a recovery parameter 'p', don't do the default redirect.
    // Let GHPageSPARecover handle it.
    if (!searchParams.get('p')) {
      router.replace('/tr');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}