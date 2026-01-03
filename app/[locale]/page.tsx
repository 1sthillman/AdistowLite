'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuPageClient from '@/components/MenuPageClient';

interface HomePageProps {
  params: { locale: string };
}

declare global {
  interface Window {
    __RESTQR_RECOVERY?: boolean;
  }
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();

  // 1. ATOMIC DETECTION (Directly from window.location)
  const recoveryInfo = useMemo(() => {
    if (typeof window === 'undefined') return { type: 'loading', data: null };

    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const p = urlParams.get('p');

    const isGlobalRecovery = window.__RESTQR_RECOVERY === true;

    if (p || isGlobalRecovery) {
      let target = decodeURIComponent(p || '');
      if (target.includes('%')) target = decodeURIComponent(target);

      const parts = target.split('/').filter(Boolean);
      const clean = parts.filter(x => !['tr', 'en', 'menu'].includes(x));
      const slug = clean[0];
      const table = clean[1] || '';

      if (slug) {
        return { type: 'recovery', data: { slug, table } };
      }
    }

    return { type: 'home', data: null };
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for the "invalid placeholder" API key from screenshot
  const isKeyInvalid = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
    // Screenshot showed: AIzaSyB-mPq-8Xy7X_p-l-0X-y-X-p-l-0X-
    return key.includes('-mPq-') || key.includes('p-l-0X-') || key === '';
  }, []);

  useEffect(() => {
    setIsMounted(true);

    if (recoveryInfo.type === 'recovery' && recoveryInfo.data) {
      const isProd = window.location.hostname !== 'localhost';
      const repoName = isProd ? '/AdistowLite' : '';
      const { slug, table } = recoveryInfo.data;
      const cleanPath = `/${params.locale}/menu/${slug}/${table ? table + '/' : ''}`;
      const cleanUrl = window.location.origin + repoName + cleanPath + window.location.hash;

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

  // --- RENDER LOGIC ---

  // A. Hydration Guard: To prevent flicker, we show a clean loader until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // B. RECOVERY MODE: Render the Menu IMMEDIATELY
  if (recoveryInfo.type === 'recovery' && recoveryInfo.data) {
    return (
      <MenuPageClient
        params={{
          locale: params.locale,
          slug: recoveryInfo.data.slug,
          table: recoveryInfo.data.table
        }}
      />
    );
  }

  // C. NORMAL HOME UI (Only if NOT loading and NOT recovery)
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Configuration Error Alert */}
      {isKeyInvalid && (
        <div className="bg-red-500 text-white p-4 text-center z-[100] flex items-center justify-center gap-3 font-bold border-b border-white/20">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>UYARI: Firebase API Anahtarı Hatalı! (Placeholder Key Tespit Edildi)</span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* BG Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="absolute top-6 right-6">
          <button onClick={toggleLanguage} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 border border-white/10 transition-all">
            <Globe className="w-4 h-4 text-emerald-500" />
            {params.locale === 'tr' ? 'TUR' : 'ENG'}
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center relative z-10">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 animate-pulse">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 italic">RestQR</h1>
          <p className="text-white/40 font-medium mb-12">Dijital Menü Çözümleri</p>

          <div className="bg-white/[0.04] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-8 tracking-widest text-emerald-500">MİSAFİR GİRİŞİ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Restoran Adı</label>
                <input
                  type="text"
                  value={restaurantSlug}
                  onChange={(e) => setRestaurantSlug(e.target.value)}
                  placeholder="örn: demo-rest"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-white/10"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95">
                <span>{isLoading ? 'BEKLEYİN...' : 'MENÜYE GİR'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}