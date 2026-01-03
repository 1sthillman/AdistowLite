'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, Globe, AlertTriangle, Loader2 } from 'lucide-react';
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
  // This state determines if we should EVER render the Home UI.
  const recoveryInfo = useMemo(() => {
    if (typeof window === 'undefined') return { type: 'loading', data: null };

    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const p = urlParams.get('p');
    const isGlobalRecovery = window.__RESTQR_RECOVERY === true;

    // IMPORTANT: If 'p' exists in search, we are IN RECOVERY.
    if (p || isGlobalRecovery) {
      let target = decodeURIComponent(p || '');
      if (target.includes('%')) target = decodeURIComponent(target);

      const parts = target.split('/').filter(Boolean);
      const clean = parts.filter(x => !['tr', 'en', 'menu'].includes(x));
      const slug = clean[0];
      const table = clean[1] || '';

      if (slug) {
        console.log('[SPA] Recovery detected:', { slug, table });
        return { type: 'recovery', data: { slug, table } };
      }

      // If we see 'p' but can't find a slug, it's still a recovery attempt.
      // We stay in 'loading' to prevent showing Home UI.
      return { type: 'loading', data: null };
    }

    return { type: 'home', data: null };
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detect placeholder keys (e.g. AIzaSyB-mPq-8Xy7X_p-l-0X-y-X-p-l-0X-)
  const isKeyInvalid = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
    return key.includes('-mPq-') || key.includes('p-l-0X-') || key === '';
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Silent URL bar cleanup
    if (recoveryInfo.type === 'recovery' && recoveryInfo.data) {
      const isProd = window.location.hostname !== 'localhost';
      const repoName = isProd ? '/AdistowLite' : '';
      const { slug, table } = recoveryInfo.data;
      const cleanPath = `/${params.locale}/menu/${slug}/${table ? table + '/' : ''}`;
      const cleanUrl = window.location.origin + repoName + cleanPath + window.location.hash;

      console.log('[SPA] Cleaning URL bar to:', cleanUrl);
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

  // A. Hydration/Recovery Protection:
  // If we are still mounting OR if recovery is detected but not yet parsed,
  // we render a clean full-screen loader. This blocks the Home UI.
  if (!isMounted || recoveryInfo.type === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/10 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-white/40 font-bold uppercase tracking-widest text-xs">Sistem Yükleniyor</p>
      </div>
    );
  }

  // B. RECOVERY PATH: Render Menu IMMEDIATELY
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

  // C. FALLBACK TO HOME UI: Only if we are MOUNTED and NOT RECOVERING
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Configuration Error Alert */}
      {isKeyInvalid && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-[100] flex items-center justify-center gap-3 font-bold"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>UYARI: Firebase API Anahtarı Hatalı! (Placeholder Key Tespit Edildi)</span>
        </motion.div>
      )}

      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-6 right-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          {params.locale === 'tr' ? 'TUR' : 'ENG'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center relative z-10"
      >
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
          <QrCode className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter italic">RestQR</h1>
        <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px] mb-12">Digital Solutions</p>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">HOŞ GELDİNİZ</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Misafir Girişi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Restoran Kodu</label>
              <input
                type="text"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value)}
                placeholder="örn: demo-rest"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-white/10 font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-lg transition-all active:scale-95 group disabled:opacity-50"
            >
              <span className="tracking-tighter">{isLoading ? 'YÜKLENİYOR...' : 'MENÜYÜ GÖR'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="mt-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">Global Standards</p>
      </motion.div>
    </div>
  );
}