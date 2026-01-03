'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. EARLY DETECTION (Even before hydration)
  // This is the CRITICAL part to avoid showing the Home UI
  const recoveryInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if (!p) return null;

    const decodedPath = decodeURIComponent(p);
    const parts = decodedPath.split('/').filter(Boolean);
    const cleanParts = parts.filter(part => !['tr', 'en', 'menu'].includes(part));

    const slug = cleanParts[0];
    const table = cleanParts[1] || '';

    if (slug) return { slug, table };
    return null;
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Silent URL cleanup IF we matched
    if (recoveryInfo) {
      const isProd = window.location.hostname !== 'localhost';
      const repoName = isProd ? '/AdistowLite' : '';
      const targetDisplayPath = `/${params.locale}/menu/${recoveryInfo.slug}/${recoveryInfo.table ? recoveryInfo.table + '/' : ''}`;
      const cleanUrl = window.location.origin + repoName + targetDisplayPath + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [recoveryInfo, params.locale]);

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

  // 2. RECOVERY RENDER (Higher priority than Home UI)
  if (recoveryInfo) {
    return (
      <MenuPageClient
        params={{
          locale: params.locale,
          slug: recoveryInfo.slug,
          table: recoveryInfo.table
        }}
      />
    );
  }

  // Hydration guard for the Home UI
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. DEFAULT HOME UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0A0A] to-black flex flex-col items-center justify-center p-4">
      {/* Home UI content remains the same but now only renders if recoveryInfo is null */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleLanguage}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all backdrop-blur-md"
        >
          <Globe className="w-4 h-4 text-emerald-500 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold text-white/90">
            {params.locale === 'tr' ? 'EN' : 'TR'}
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-[2rem] mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter italic">RestQR</h1>
          <p className="text-gray-400 font-medium">
            {params.locale === 'tr' ? 'Modern Menü Çözümü' : 'Modern Menu Solution'}
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
          <h2 className="text-xl font-black text-white mb-8 text-center uppercase tracking-widest text-emerald-500">
            {params.locale === 'tr' ? 'Giriş Yap' : 'Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">
                {params.locale === 'tr' ? 'Restoran Kodu' : 'Restaurant Code'}
              </label>
              <input
                type="text"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value)}
                placeholder={params.locale === 'tr' ? 'örn: demo-restaurant' : 'e.g. demo-restaurant'}
                className="w-full px-8 py-5 bg-black/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white outline-none transition-all font-bold text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 px-8 rounded-3xl flex items-center justify-center gap-4 transition-all"
            >
              {isLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <span>DEVAM ET</span>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}