'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuPageClient from '@/components/MenuPageClient';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initial State: Starting as 'detecting' is the only way to prevent flicker
  const [isMounted, setIsMounted] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{ slug: string; table: string } | null>(null);

  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ATOMIC DETECTION
    const url = new URL(window.location.href);
    const p = url.searchParams.get('p');

    if (p) {
      // Decode twice just in case of environment differences
      let target = decodeURIComponent(p);
      if (target.includes('%')) target = decodeURIComponent(target);

      console.log('[Resolver] Raw P:', p, '-> Decoded:', target);

      const parts = target.split('/').filter(Boolean);
      // Standardize: Remove locale and 'menu' markers
      const clean = parts.filter(x => !['tr', 'en', 'menu'].includes(x));

      const slug = clean[0];
      const table = clean[1] || '';

      if (slug) {
        console.log('[Resolver] Found Menu:', { slug, table });
        setRecoveryData({ slug, table });

        // CLEAN URL BAR
        const isProd = window.location.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';
        const cleanPath = `/${params.locale}/menu/${slug}/${table ? table + '/' : ''}`;
        const cleanUrl = window.location.origin + repoName + cleanPath + window.location.hash;

        window.history.replaceState(null, '', cleanUrl);
      }
    }

    setIsMounted(true);
  }, [params.locale]);

  const toggleLanguage = () => {
    const newLocale = params.locale === 'tr' ? 'en' : 'tr';
    router.push(`/${newLocale}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantSlug.trim()) {
      setIsLoading(true);
      const target = `/menu/${restaurantSlug}/`;
      router.push(`/${params.locale}/?p=${encodeURIComponent(target)}`);
    }
  };

  // --- RENDER BRANCHES ---

  // 1. Loading/Detecting Step (To prevent showing Home UI by mistake)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. If recovery data exists, render Menu IMMEDIATELY
  if (recoveryData) {
    return (
      <MenuPageClient
        params={{
          locale: params.locale,
          slug: recoveryData.slug,
          table: recoveryData.table
        }}
      />
    );
  }

  // 3. Fallback: Only show Home UI if no recovery data was found after mounting
  // We double check 'p' again to be absolutely sure
  const hasP = searchParams.get('p');
  if (hasP && !recoveryData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
          <Globe className="w-4 h-4 text-emerald-500" />
          {params.locale === 'tr' ? 'EN' : 'TR'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <QrCode className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">RestQR</h1>
        <p className="text-gray-400 mb-10">Modern Menü Çözümü</p>

        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10">
          <h2 className="text-xl font-bold text-emerald-500 uppercase mb-8">Menüyü Görüntüle</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={restaurantSlug}
              onChange={(e) => setRestaurantSlug(e.target.value)}
              placeholder="Restoran Kodu"
              className="w-full px-8 py-5 bg-black/50 border border-white/5 rounded-3xl text-white font-bold outline-none"
              required
            />
            <button className="w-full bg-emerald-500 py-5 rounded-3xl text-white font-black flex items-center justify-center gap-3">
              {isLoading ? '...' : 'MENÜYÜ AÇ'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}